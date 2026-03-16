"use client";

import React, { useEffect } from "react";
import { Menu, Moon, Search, Settings, Sun, User } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode } from "@/state";

const Navbar = () => {
  const dispatch = useAppDispatch();

  // CORRECTION: get dark mode state from redux
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // CORRECTION: apply dark class to html
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-black">
      
      {/* Left Section */}
      <div className="flex items-center gap-8">
        <button>
          <Menu className="h-8 w-8 dark:text-white" />
        </button>

        <div className="relative flex h-min w-[200px]">
          <Search className="absolute left-[4px] top-1/2 h-5 w-5 -translate-y-1/2 transform dark:text-white" />
          <input
            className="w-full rounded border-none bg-gray-100 p-2 pl-8 placeholder-gray-500 focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-white"
            type="search"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center">
        
        {/* CORRECTION: dark mode toggle */}
        <button
          onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
          className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isDarkMode ? (
            <Sun className="h-6 w-6 dark:text-white" />
          ) : (
            <Moon className="h-6 w-6 dark:text-white" />
          )}
        </button>

        <Link
          href="/settings"
          className="h-min w-min rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Settings className="h-6 w-6 dark:text-white" />
        </Link>

        <div className="ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] bg-gray-200 md:inline-block"></div>

        <div className="hidden items-center justify-between md:flex">
          <div className="flex h-9 w-9 items-center justify-center">
            <User className="h-6 w-6 rounded-full dark:text-white" />
          </div>

          <span className="mx-3 text-gray-800 dark:text-white">Username</span>

          <button className="rounded bg-blue-400 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;