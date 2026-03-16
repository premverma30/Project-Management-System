"use client";

import {
  Home,
  Briefcase,
  Search,
  Settings,
  User,
  Users,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  Layers3,
  LockIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const Sidebar = () => {
  // STATE
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(true);

  return (
    <div className="fixed flex h-full w-64 flex-col justify-between bg-white shadow-xl">

      <div className="flex w-full flex-col">

        {/* LOGO */}
        <div className="flex min-h-[56px] items-center px-6 pt-3">
          <div className="text-xl font-bold text-gray-800">
            EDLIST
          </div>
        </div>

        {/* TEAM */}
        <div className="flex items-center gap-5 border-y px-8 py-4">
          <Image src="/logo.png" alt="Logo" width={40} height={40} priority />
          <div>
            <h3 className="text-md font-bold">EDROH TEAM</h3>
            <div className="mt-1 flex items-center gap-2">
              <LockIcon className="h-3 w-3 text-gray-500" />
              <p className="text-xs text-gray-500">Private</p>
            </div>
          </div>
        </div>

        {/* NAV LINKS */}
        <nav className="w-full">
          <SidebarLink icon={Home} label="Home" href="/" />
          <SidebarLink icon={Briefcase} label="Timeline" href="/timeline" />
          <SidebarLink icon={Search} label="Search" href="/search" />
          <SidebarLink icon={Settings} label="Settings" href="/settings" />
          <SidebarLink icon={User} label="Users" href="/users" />
          <SidebarLink icon={Users} label="Teams" href="/teams" />
        </nav>

        {/* PROJECTS BUTTON */}
        <button
          onClick={() => setShowProjects(!showProjects)}
          className="flex items-center justify-between px-8 py-3 text-gray-500"
        >
          <span>Projects</span>
          {showProjects ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {/* PROJECT LIST */}
        {showProjects && (
          <>
            <SidebarLink icon={Briefcase} label="Project One" href="#" />
            <SidebarLink icon={Briefcase} label="Project Two" href="#" />
          </>
        )}

        {/* PRIORITY BUTTON */}
        <button
          onClick={() => setShowPriority(!showPriority)}
          className="flex items-center justify-between px-8 py-3 text-gray-500"
        >
          <span>Priority</span>
          {showPriority ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {/* PRIORITY LIST */}
        {showPriority && (
          <>
            <SidebarLink icon={AlertCircle} label="Urgent" href="#" />
            <SidebarLink icon={ShieldAlert} label="High" href="#" />
            <SidebarLink icon={AlertTriangle} label="Medium" href="#" />
            <SidebarLink icon={AlertOctagon} label="Low" href="#" />
            <SidebarLink icon={Layers3} label="Backlog" href="#" />
          </>
        )}
      </div>

      {/* USER */}
      <div className="flex items-center gap-3 px-8 py-4">
        <User className="h-6 w-6" />
        <span className="text-gray-800">Username</span>
      </div>
    </div>
  );
};

const SidebarLink = ({ href, icon: Icon, label }: any) => {
  return (
    <Link href={href} className="w-full">
      <div className="flex items-center gap-3 px-8 py-3 hover:bg-gray-100">
        <Icon className="h-6 w-6 text-gray-800" />
        <span className="font-medium text-gray-800">{label}</span>
      </div>
    </Link>
  );
};

export default Sidebar;