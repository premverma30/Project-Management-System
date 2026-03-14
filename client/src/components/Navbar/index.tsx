import React from "react";
import { Menu, Moon, Search, Settings, User } from "lucide-react";
import Link from "next/link";

const Navbar = () => {
  return (
    <div className="flex items-center justify-between bg-white px-4 py-3">
      
      {/* Left Section */}
      <div className="flex items-center gap-8">
        <button>
          <Menu className="h-8 w-8" />
        </button>

        <div className="relative flex h-min w-[200px]">
          <Search className="absolute left-[4px] top-1/2 h-5 w-5 -translate-y-1/2 transform" />
          <input
            className="w-full rounded border-none bg-gray-100 p-2 pl-8 placeholder-gray-500 focus:outline-none"
            type="search"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center">
        
        <button className="rounded p-2 hover:bg-gray-100">
          <Moon className="h-6 w-6" />
        </button>

        <Link
          href="/settings"
          className="h-min w-min rounded p-2 hover:bg-gray-100"
        >
          <Settings className="h-6 w-6" />
        </Link>

        <div className="ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] bg-gray-200 md:inline-block"></div>

        <div className="hidden items-center justify-between md:flex">
          <div className="flex h-9 w-9 items-center justify-center">
            <User className="h-6 w-6 rounded-full" />
          </div>

          <span className="mx-3 text-gray-800">Username</span>

          <button className="rounded bg-blue-400 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;