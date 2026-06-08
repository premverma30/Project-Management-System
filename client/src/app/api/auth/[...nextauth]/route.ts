import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const SEVEN_DAYS = 7 * 24 * 60 * 60; // 604800 seconds — matches backend JWT_EXPIRES_IN

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
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              googleId: account?.providerAccountId,
              email: user.email,
              username: user.name?.replace(/\s+/g, "").toLowerCase(),
              profilePictureUrl: user.image,
            }),
          }
        );

        if (!res.ok) {
          console.error("[NextAuth] Backend sync failed:", res.status, await res.text());
          return false;
        }

        const data = await res.json();
        // Attach backend-specific fields to user object.
        // These are picked up by the jwt callback below.
        (user as any).backendToken = data.token;
        (user as any).mongoId = data.user._id;
        return true;
      } catch (error) {
        console.error("[NextAuth] signIn error syncing user to backend:", error);
        return false;
      }
    },

    /**
     * jwt: called whenever a JWT is created or updated.
     * On first sign-in `user` is populated — we transfer backend fields into the token.
     * On subsequent calls (session reads, refresh) `user` is undefined — we pass token through.
     */
    async jwt({ token, user }) {
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
