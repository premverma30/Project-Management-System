import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const SEVEN_DAYS = 7 * 24 * 60 * 60; // 604800 seconds — matches backend JWT_EXPIRES_IN

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 5) {
  let attempt = 0;
  // Start with a 3s delay for Render cold starts
  let delay = 3000; 
  
  while (attempt <= maxRetries) {
    try {
      // 15-second timeout per fetch to ensure it doesn't hang indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      console.log(`[NextAuth] Fetching backend sync: ${url} (Attempt ${attempt + 1}/${maxRetries + 1})`);
      
      const res = await fetch(url, {
        ...options,
        signal: controller.signal as any,
      });
      
      clearTimeout(timeoutId);

      // Return immediately if it's a success (2xx) or a client error (4xx other than 429)
      // We don't want to retry 400 Bad Request or 401 Unauthorized
      if (res.ok || (res.status >= 400 && res.status < 500 && res.status !== 429)) {
        return res;
      }
      
      // If it's 429 or 5xx, we should retry
      const text = await res.text();
      console.warn(`[NextAuth] Backend returned ${res.status} on attempt ${attempt + 1}: ${text.substring(0, 100)}`);
      
      if (attempt === maxRetries) {
        throw new Error(`Backend failed with status ${res.status}`);
      }
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.warn(`[NextAuth] Backend sync fetch failed on attempt ${attempt + 1}:`, error.message);
    }
    
    console.log(`[NextAuth] Waiting ${delay}ms before next retry...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Exponential backoff capped at 30s
    delay = Math.min(delay * 2, 30000);
    attempt++;
  }
  
  throw new Error("Backend sync failed after retries");
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
     * We sync the Google user to our MongoDB backend and store the backend
     * JWT and MongoDB _id on the user object so the jwt callback can pick them up.
     */
    async signIn({ user, account }) {
      // Debug: log incoming OAuth account and user details to help diagnose intermittent AccessDenied
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
      try {
        // Defensive: some providers or edge-cases may not populate account.providerAccountId.
        // Fall back to email local-part to avoid missing-field rejections from backend.
        const googleId = account?.providerAccountId ?? user.email;
        const username = user.name
          ? user.name.replace(/\s+/g, "").toLowerCase()
          : (user.email || "").split("@")[0];

        const res = await fetchWithRetry(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            googleId,
            email: user.email,
            username,
            profilePictureUrl: user.image,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("[NextAuth] Backend sync failed:", res.status, text);
          throw new Error("BackendSyncFailed");
        }

        const data = await res.json();
        // Attach backend-specific fields to user object.
        // These are picked up by the jwt callback below.
        (user as any).backendToken = data.token;
        (user as any).mongoId = data.user._id;
        return true;
      } catch (error) {
        console.error("[NextAuth] signIn error syncing user to backend:", error);
        throw error;
      }
    },

    /**
     * jwt: called whenever a JWT is created or updated.
     * On first sign-in `user` is populated — we transfer backend fields into the token.
     * On subsequent calls (session reads, refresh) `user` is undefined — we pass token through.
     */
    async jwt({ token, user }) {
      try {
        console.log("[NextAuth] jwt callback", { hasUser: !!user, tokenSnapshot: { ...token } });
      } catch (e) {
        console.error("[NextAuth] jwt log error", e);
      }
      if (user) {
        token.backendToken = (user as any).backendToken;
        token.mongoId = (user as any).mongoId;
      }
      return token;
    },

    /**
     * session: called whenever a session is checked (useSession, getSession, middleware).
     * We expose backendToken and mongoId to the client so RTK Query can attach the
     * Authorization header and the UI can identify the current user's MongoDB _id.
     */
    async session({ session, token }) {
      try {
        console.log("[NextAuth] session callback", { sessionUser: session.user?.email, hasBackendToken: !!(token as any).backendToken });
      } catch (e) {
        console.error("[NextAuth] session log error", e);
      }
      (session as any).backendToken = token.backendToken;
      (session as any).mongoId = token.mongoId;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login", // redirect auth errors to login page
  },
});

export { handler as GET, handler as POST };
