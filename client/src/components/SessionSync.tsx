"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/app/redux";
import { setSessionCredentials } from "@/state";

/**
 * SessionSync — bridges NextAuth's useSession() into Redux state.
 *
 * This component renders no UI. It watches the NextAuth session and
 * dispatches backendToken + mongoId into the global Redux slice whenever
 * the session changes. RTK Query's prepareHeaders then reads the token
 * from Redux state (via getState()) instead of calling getSession(),
 * eliminating a network round-trip on every API request.
 */
export default function SessionSync() {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === "authenticated" && session) {
      dispatch(
        setSessionCredentials({
          backendToken: (session as any).backendToken ?? null,
          mongoId: (session as any).mongoId ?? null,
        }),
      );
    } else if (status === "unauthenticated") {
      dispatch(setSessionCredentials({ backendToken: null, mongoId: null }));
    }
    // Don't dispatch during "loading" — keep the previous values until resolved.
  }, [session, status, dispatch]);

  return null;
}
