"use client";

import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import StoreProvider, { useAppSelector } from "./redux";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // We only need session status here for the loading spinner.
  // The middleware (middleware.ts) is the authoritative route guard —
  // we deliberately do NOT redirect here to avoid the CRIT-01 race condition
  // where status briefly reads "loading" during client navigation, causing
  // premature router.push("/login") calls.
  const { status } = useSession();
  const pathname = usePathname();

  // Single location that applies the dark mode class to <html>.
  // Navbar previously had a duplicate of this effect (MAJ-02) — removed there.
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Landing page — no app shell (no sidebar, no navbar)
  if (pathname === "/") {
    return (
      <main className="min-h-screen w-full bg-background text-foreground">
        {children}
      </main>
    );
  }

  // Login page — no app shell
  if (pathname === "/login") {
    return (
      <main className="min-h-screen w-full bg-background text-foreground">
        {children}
      </main>
    );
  }

  // Session is being resolved on the client.
  // This is normal on first load and during fast navigation.
  // We show a spinner instead of redirecting — the middleware already
  // blocked unauthenticated access server-side before we get here.
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Loading workspace…
          </p>
        </div>
      </div>
    );
  }

  // Authenticated app shell
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <Sidebar />
      <main
        className={`flex w-full flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "" : "md:pl-64"
        }`}
      >
        <Navbar />
        {children}
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};

export default DashboardWrapper;
