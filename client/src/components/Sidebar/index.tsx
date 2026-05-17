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
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import { useGetProjectsQuery } from "@/state/api";
import { useSession, signOut } from "next-auth/react";

const Sidebar = () => {
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(true);

  const { data: projects } = useGetProjectsQuery();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const { data: session } = useSession();

  const sidebarClassNames = `fixed flex flex-col h-[100%] justify-between shadow-2xl
    transition-all duration-300 z-40 bg-background/80 backdrop-blur-xl border-r border-border
    ${isSidebarCollapsed ? "w-0 hidden" : "w-64"}
  `;

  return (
    <div className={sidebarClassNames}>
      <div className="flex h-[100%] w-full flex-col justify-start overflow-y-auto overflow-x-hidden">
        {/* TOP LOGO */}
        <div className="z-50 flex min-h-[72px] w-64 items-center justify-between px-6 pt-3">
          <div className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
            NEXTASK AI
          </div>
          {isSidebarCollapsed ? null : (
            <button
              className="py-3"
              onClick={() => {
                dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
              }}
            >
              <X className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
          )}
        </div>
        {/* TEAM */}
        <div className="flex items-center gap-4 border-y border-border px-6 py-5">
          <div className="relative h-10 w-10 flex-shrink-0">
            <Image src="/logo.png" alt="Logo" fill className="object-cover rounded-lg" priority />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-foreground">
              NexTask Team
            </h3>
            <div className="mt-0.5 flex items-center gap-1.5">
              <LockIcon className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground font-medium">Private Workspace</p>
            </div>
          </div>
        </div>
        {/* NAVBAR LINKS */}
        <nav className="z-10 w-full">
          <SidebarLink icon={Home} label="Home" href="/" />
          <SidebarLink icon={Briefcase} label="Timeline" href="/timeline" />
          <SidebarLink icon={Search} label="Search" href="/search" />
          <SidebarLink icon={Settings} label="Settings" href="/settings" />
          <SidebarLink icon={User} label="Users" href="/users" />
          <SidebarLink icon={Users} label="Teams" href="/teams" />
        </nav>

        {/* PROJECTS LINKS */}
        <button
          onClick={() => setShowProjects((prev) => !prev)}
          className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
        >
          <span className="">Projects</span>
          {showProjects ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
        {/* PROJECTS LIST */}
        {showProjects &&
          projects?.map((project) => (
            <SidebarLink
              key={project._id || project.id}
              icon={Briefcase}
              label={project.name}
              href={`/project/${project._id || project.id}`}
            />
          ))}

        {/* PRIORITIES LINKS */}
        <button
          onClick={() => setShowPriority((prev) => !prev)}
          className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
        >
          <span className="">Priority</span>
          {showPriority ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
        {showPriority && (
          <>
            <SidebarLink
              icon={AlertCircle}
              label="Urgent"
              href="/priority/urgent"
            />
            <SidebarLink
              icon={ShieldAlert}
              label="High"
              href="/priority/high"
            />
            <SidebarLink
              icon={AlertTriangle}
              label="Medium"
              href="/priority/medium"
            />
            <SidebarLink icon={AlertOctagon} label="Low" href="/priority/low" />
            <SidebarLink icon={Layers3} label="Backlog" href="/priority/backlog" />
          </>
        )}
      </div>
      <div className="z-10 mt-auto flex w-full flex-col items-center gap-4 border-t border-border px-6 py-6 md:hidden">
        <div className="flex w-full items-center">
          <div className="relative h-10 w-10 flex-shrink-0">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                fill
                className="rounded-full object-cover border border-border"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
          <span className="mx-3 font-medium text-foreground truncate">
            {session?.user?.name || "User"}
          </span>
          <button
            className="ml-auto rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  icon: any;
  label: string;
}

const SidebarLink = ({ href, icon: Icon, label }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className="w-full">
      <div
        className={`group relative flex cursor-pointer items-center gap-3 transition-all duration-200 justify-start px-6 py-3 mx-2 my-1 rounded-md ${
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
        )}

        <Icon
          className={`h-5 w-5 transition-colors ${
            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          }`}
        />
        <span className="font-medium text-sm tracking-tight">{label}</span>
      </div>
    </Link>
  );
};

export default Sidebar;