import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            googleId: account?.providerAccountId,
            email: user.email,
            username: user.name?.replace(/\s+/g, "").toLowerCase(),
            profilePictureUrl: user.image,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          (user as any).backendToken = data.token;
          (user as any).mongoId = data.user._id;
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error syncing user to backend:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.backendToken = (user as any).backendToken;
        token.mongoId = (user as any).mongoId;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).backendToken = token.backendToken;
      (session as any).mongoId = token.mongoId;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
