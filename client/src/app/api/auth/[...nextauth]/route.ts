import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const SEVEN_DAYS = 7 * 24 * 60 * 60; // 604800 seconds — matches backend JWT_EXPIRES_IN

/**
 * Attempt a single backend sync call. Returns { token, user } on success,
 * or null on any failure (429, network error, non-ok status).
 * Does NOT throw — callers decide how to handle null.
 */
async function tryBackendSync(payload: {
  googleId: string;
  email: string;
  username: string;
  profilePictureUrl?: string | null;
}): Promise<{ token: string; user: { _id: string } } | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn("[NextAuth] Backend sync failed:", res.status, text);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.warn("[NextAuth] Backend sync network error:", error);
    return null;
  }
}

/**
 * Attempt backend sync with exponential backoff (up to 3 attempts).
 * Returns the sync result or null if all attempts fail.
 */
async function syncWithRetry(payload: Parameters<typeof tryBackendSync>[0]) {
  let delay = 1000;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const result = await tryBackendSync(payload);
    if (result) {
      console.log(`[NextAuth] Backend sync succeeded on attempt ${attempt}`);
      return result;
    }
    console.warn(`[NextAuth] Backend sync attempt ${attempt} failed`);
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
  return null;
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
    // Align with backend JWT_EXPIRES_IN=7d so both expire together.
    // Previously NextAuth defaulted to 30d while backend token expired in 7d,
    // causing silent 401 errors on API calls after day 7.
    maxAge: SEVEN_DAYS,
    updateAge: 24 * 60 * 60, // refresh session cookie every 24h
  },

  callbacks: {
    /**
     * signIn: called immediately after Google OAuth completes.
     * We attempt to sync the Google user to our MongoDB backend.
     * If the sync fails (e.g. 429 rate limit from Render), we STILL allow
     * sign-in to proceed — the pending sync data is stored in the user object
     * and the jwt callback will retry on subsequent session checks.
     */
    async signIn({ user, account }) {
      try {
        console.log("[NextAuth] signIn invoked", {
          provider: account?.provider,
          providerAccountId: account?.providerAccountId,
          email: user?.email,
          name: user?.name,
          NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        });
      } catch (e) {
        console.error("[NextAuth] signIn log error", e);
      }

      // Defensive: some providers or edge-cases may not populate account.providerAccountId.
      // Fall back to email local-part to avoid missing-field rejections from backend.
      const googleId = account?.providerAccountId ?? user.email ?? "";
      const username = user.name
        ? user.name.replace(/\s+/g, "").toLowerCase()
        : (user.email || "").split("@")[0];

      const syncPayload = {
        googleId,
        email: user.email || "",
        username,
        profilePictureUrl: user.image,
      };

      const data = await syncWithRetry(syncPayload);

      if (data) {
        // Backend sync succeeded — attach backend fields to user object.
        (user as any).backendToken = data.token;
        (user as any).mongoId = data.user._id;
      } else {
        // Backend sync failed after retries — allow sign-in anyway.
        // Store the sync payload so the jwt callback can retry later.
        console.warn("[NextAuth] Backend sync failed after all retries. Allowing sign-in with pending sync.");
        (user as any).pendingSyncPayload = syncPayload;
      }

      // Always allow sign-in — never block the user due to backend issues.
      return true;
    },

    /**
     * jwt: called whenever a JWT is created or updated.
     * On first sign-in `user` is populated — we transfer backend fields into the token.
     * If backendToken is missing but pendingSyncPayload exists, we retry the sync
     * on every session check until it succeeds (lazy retry).
     */
    async jwt({ token, user }) {
      if (user) {
        // First sign-in: transfer fields from user object to token.
        token.backendToken = (user as any).backendToken;
        token.mongoId = (user as any).mongoId;
        // Store pending sync payload if the initial sync failed.
        if ((user as any).pendingSyncPayload) {
          token.pendingSyncPayload = (user as any).pendingSyncPayload;
        }
      }

      // Lazy retry: if we have a pending sync (no backendToken yet), try again.
      if (!token.backendToken && token.pendingSyncPayload) {
        console.log("[NextAuth] jwt: attempting lazy backend sync retry...");
        const data = await tryBackendSync(
          token.pendingSyncPayload as Parameters<typeof tryBackendSync>[0]
        );
        if (data) {
          console.log("[NextAuth] jwt: lazy sync succeeded!");
          token.backendToken = data.token;
          token.mongoId = data.user._id;
          delete token.pendingSyncPayload; // Clear pending flag
        } else {
          console.warn("[NextAuth] jwt: lazy sync still failing, will retry on next session check.");
        }
      }

      return token;
    },

    /**
     * session: called whenever a session is checked (useSession, getSession, middleware).
     * We expose backendToken and mongoId to the client so RTK Query can attach the
     * Authorization header and the UI can identify the current user's MongoDB _id.
     */
    async session({ session, token }) {
      (session as any).backendToken = token.backendToken;
      (session as any).mongoId = token.mongoId;
      // Let the client know if backend sync is still pending
      (session as any).syncPending = !token.backendToken && !!token.pendingSyncPayload;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login", // redirect auth errors to login page
  },
});

export { handler as GET, handler as POST };
