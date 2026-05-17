"use client";

import React, { useEffect } from "react";
import { Menu, Moon, Search, Settings, Sun, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="sticky top-0 z-30 flex w-full items-center justify-between bg-background/80 px-6 py-3 backdrop-blur-xl border-b border-border shadow-sm transition-all duration-300">
      
      {/* Left Section */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
          className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden md:flex h-10 w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-full border border-border bg-muted/50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary dark:bg-muted/20 text-foreground placeholder:text-muted-foreground"
            type="search"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        <button
          onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
          className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        <Link
          href="/settings"
          className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Settings className="h-5 w-5" />
        </Link>

        <div className="hidden h-6 w-px bg-border md:block mx-1"></div>

        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-border">
              {session?.user?.image ? (
                <Image src={session.user.image} alt={session.user.name || "User"} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-foreground">
              {session?.user?.name || "User"}
            </span>
          </div>

          <Button 
            onClick={() => signOut()}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;