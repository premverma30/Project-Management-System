import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Next.js Middleware — single authoritative source of route protection.
 *
 * Strategy:
 * - Public routes (/, /login) are always accessible.
 * - All other routes require a valid NextAuth JWT session token.
 * - If unauthenticated, NextAuth automatically redirects to /login.
 *
 * The client-side DashboardWrapper NO LONGER performs its own redirect.
 * This middleware is the only guard — avoiding the race condition that
 * caused the re-login loop (CRIT-01).
 */
export default withAuth(
  function middleware(_req) {
    // Middleware function body — just pass through after auth check.
    return NextResponse.next();
  },
  {
    callbacks: {
      /**
       * authorized: called for every matched request.
       * Returns true  → allow request
       * Returns false → redirect to signIn page (defined in `pages`)
       */
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        // Always allow public routes through regardless of token.
        if (
          pathname === "/" ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/api/auth")
        ) {
          return true;
        }

        // All other routes require a valid session token.
        // NextAuth populates `token` from the session JWT cookie.
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon\\.ico).*)",
//   ],
// };

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico).*)",
  ],
};
