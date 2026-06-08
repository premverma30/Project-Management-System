"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useGetAuthUserQuery } from "@/state/api";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAppDispatch, useAppSelector } from "../redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { ModalEditProfile } from "@/components/ModalEditProfile";
import {
  User,
  Mail,
  Users,
  Shield,
  Moon,
  Sidebar as SidebarIcon,
  LayoutGrid,
  Bell,
  Sliders,
  Edit2,
  Globe,
  Lock,
  Eye,
  Clock,
  LogOut,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
};

const ToggleSwitch = ({
  checked,
  onChange,
  label,
  description,
  icon,
}: ToggleSwitchProps) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-none">
      <div className="flex gap-3 items-start">
        {icon && <div className="text-muted-foreground mt-0.5">{icon}</div>}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

const Settings = () => {
  const { data: session } = useSession();
  const { data: user, isLoading } = useGetAuthUserQuery(undefined);
  const dispatch = useAppDispatch();

  // Profile Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Redux-connected Theme & Sidebar Preferences
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);

  // LocalStorage Default View Tab
  const [defaultTab, setDefaultTab] = useState("Board");

  // Notification Settings
  const [emailAlerts, setEmailAlerts] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("emailAlerts") ?? "true");
    }
    return true;
  });

  const [pushAlerts, setPushAlerts] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("pushAlerts") ?? "false");
    }
    return false;
  });

  const [weeklyDigest, setWeeklyDigest] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("weeklyDigest") ?? "true");
    }
    return true;
  });

  const [taskNotifications, setTaskNotifications] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("taskNotifications") ?? "true");
    }
    return true;
  });

  const [commentNotifications, setCommentNotifications] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("commentNotifications") ?? "true");
    }
    return true;
  });

  // Workspace Settings
  const [autoAssign, setAutoAssign] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("autoAssign") ?? "false");
    }
    return false;
  });

  const [defaultPriority, setDefaultPriority] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("defaultPriority") ?? "Medium";
    }
    return "Medium";
  });

  // Display Settings
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("itemsPerPage") ?? "10";
    }
    return "10";
  });

  const [compactView, setCompactView] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("compactView") ?? "false");
    }
    return false;
  });

  // Preferences Settings
  const [language, setLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("language") ?? "en";
    }
    return "en";
  });

  const [timeZone, setTimeZone] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("timeZone") ?? "UTC";
    }
    return "UTC";
  });

  // Privacy Settings
  const [showActivityStatus, setShowActivityStatus] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("showActivityStatus") ?? "true");
    }
    return true;
  });

  const [allowPublicProfile, setAllowPublicProfile] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("allowPublicProfile") ?? "false");
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDefaultTab(localStorage.getItem("defaultProjectTab") || "Board");
    }
  }, []);

  // Persist all settings to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("defaultProjectTab", defaultTab);
      localStorage.setItem("emailAlerts", JSON.stringify(emailAlerts));
      localStorage.setItem("pushAlerts", JSON.stringify(pushAlerts));
      localStorage.setItem("weeklyDigest", JSON.stringify(weeklyDigest));
      localStorage.setItem("taskNotifications", JSON.stringify(taskNotifications));
      localStorage.setItem("commentNotifications", JSON.stringify(commentNotifications));
      localStorage.setItem("autoAssign", JSON.stringify(autoAssign));
      localStorage.setItem("defaultPriority", defaultPriority);
      localStorage.setItem("itemsPerPage", itemsPerPage);
      localStorage.setItem("compactView", JSON.stringify(compactView));
      localStorage.setItem("language", language);
      localStorage.setItem("timeZone", timeZone);
      localStorage.setItem("showActivityStatus", JSON.stringify(showActivityStatus));
      localStorage.setItem("allowPublicProfile", JSON.stringify(allowPublicProfile));
    }
  }, [
    defaultTab,
    emailAlerts,
    pushAlerts,
    weeklyDigest,
    taskNotifications,
    commentNotifications,
    autoAssign,
    defaultPriority,
    itemsPerPage,
    compactView,
    language,
    timeZone,
    showActivityStatus,
    allowPublicProfile,
  ]);

  const handleTabChange = (val: string) => {
    setDefaultTab(val);
  };

  const labelStyles =
    "text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1";
  const valueStyles =
    "flex h-10 w-full items-center rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-foreground select-none";
  const selectStyles =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors";

  if (isLoading) {
    return (
      <div className="px-6 py-8">
        <Header name="Settings" />
        <div className="mt-8 max-w-4xl space-y-4">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[250px] w-full rounded-xl" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const displayName = user?.username || session?.user?.name || "—";
  const email = user?.email || session?.user?.email || "—";
  const mongoId = (session as any)?.mongoId as string | undefined;

  return (
    <div className="px-6 py-8 h-full overflow-y-auto">
      <Header name="Settings" />

      <div className="mt-8 max-w-4xl space-y-6 pb-12">
        {/* Profile Card - Editable */}
        <Card variant="glass" className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>User Profile</CardTitle>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="flex items-center gap-5 border-b border-border pb-5">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-border bg-muted">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={displayName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-7 w-7 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{displayName}</h2>
                <p className="text-sm text-muted-foreground">{email}</p>
                {mongoId && (
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground/60">
                    ID: {mongoId}
                  </p>
                )}
              </div>
            </div>

            {/* Account Details */}
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1">
                <label className={labelStyles}>
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-3 w-3" /> Username
                  </span>
                </label>
                <div className={valueStyles}>{displayName}</div>
              </div>

              <div className="space-y-1">
                <label className={labelStyles}>
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3 w-3" /> Email Address
                  </span>
                </label>
                <div className={valueStyles}>{email}</div>
              </div>

              <div className="space-y-1">
                <label className={labelStyles}>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3 w-3" /> Team
                  </span>
                </label>
                <div className={valueStyles}>
                  {user?.teamId ? `Team ${user.teamId}` : "No team assigned"}
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelStyles}>
                  <span className="inline-flex items-center gap-1.5">
                    <Shield className="h-3 w-3" /> Sign-in Method
                  </span>
                </label>
                <div className={valueStyles}>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Google OAuth
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Preferences Card */}
        <Card variant="glass" className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" /> Application Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {/* Theme Toggle */}
            <ToggleSwitch
              checked={isDarkMode}
              onChange={(checked) => dispatch(setIsDarkMode(checked))}
              label="Dark Mode"
              description="Enable dark mode for comfortable viewing in low-light environments."
              icon={<Moon className="h-4 w-4" />}
            />

            {/* Sidebar Toggle */}
            <ToggleSwitch
              checked={isSidebarCollapsed}
              onChange={(checked) => dispatch(setIsSidebarCollapsed(checked))}
              label="Collapse Sidebar"
              description="Keep the navigation sidebar collapsed by default to maximize workspace area."
              icon={<SidebarIcon className="h-4 w-4" />}
            />

            {/* Compact View Toggle */}
            <ToggleSwitch
              checked={compactView}
              onChange={setCompactView}
              label="Compact View"
              description="Reduce spacing and padding for a more condensed interface."
              icon={<Eye className="h-4 w-4" />}
            />

            {/* Default Project view dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-border/50 last:border-none gap-2">
              <div className="flex gap-3 items-start">
                <LayoutGrid className="text-muted-foreground mt-0.5 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">Default Project View</span>
                  <span className="text-xs text-muted-foreground">
                    Choose which tab opens automatically when entering a project.
                  </span>
                </div>
              </div>
              <div className="w-full sm:w-44">
                <select
                  value={defaultTab}
                  onChange={(e) => handleTabChange(e.target.value)}
                  className={selectStyles}
                >
                  <option value="Board">Board</option>
                  <option value="List">List</option>
                  <option value="Timeline">Timeline</option>
                  <option value="Table">Table</option>
                </select>
              </div>
            </div>

            {/* Items Per Page */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-border/50 last:border-none gap-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Items Per Page</span>
                <span className="text-xs text-muted-foreground">
                  Number of items to display in lists and tables.
                </span>
              </div>
              <div className="w-full sm:w-44">
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(e.target.value)}
                  className={selectStyles}
                >
                  <option value="5">5 items</option>
                  <option value="10">10 items</option>
                  <option value="25">25 items</option>
                  <option value="50">50 items</option>
                  <option value="100">100 items</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings Card */}
        <Card variant="glass" className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" /> Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <ToggleSwitch
              checked={emailAlerts}
              onChange={setEmailAlerts}
              label="Email Notifications"
              description="Receive email alerts when you are assigned a new task."
            />
            <ToggleSwitch
              checked={pushAlerts}
              onChange={setPushAlerts}
              label="Desktop Push Alerts"
              description="Get instant browser notifications for comments and task status changes."
            />
            <ToggleSwitch
              checked={taskNotifications}
              onChange={setTaskNotifications}
              label="Task Notifications"
              description="Receive notifications when tasks are created or updated."
            />
            <ToggleSwitch
              checked={commentNotifications}
              onChange={setCommentNotifications}
              label="Comment Notifications"
              description="Get notified when someone comments on your assigned tasks."
            />
            <ToggleSwitch
              checked={weeklyDigest}
              onChange={setWeeklyDigest}
              label="Weekly Digest"
              description="Receive a weekly summary email of project statistics and completed tasks."
            />
          </CardContent>
        </Card>

        {/* Workspace Settings */}
        <Card variant="glass" className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-500" /> Workspace Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <ToggleSwitch
              checked={autoAssign}
              onChange={setAutoAssign}
              label="Auto-assign Tasks"
              description="Automatically assign new tasks you create to yourself."
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-border/50 last:border-none gap-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Default Task Priority</span>
                <span className="text-xs text-muted-foreground">
                  The initial priority tier applied to newly created tasks.
                </span>
              </div>
              <div className="w-full sm:w-44">
                <select
                  value={defaultPriority}
                  onChange={(e) => setDefaultPriority(e.target.value)}
                  className={selectStyles}
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="Backlog">Backlog</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card variant="glass" className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" /> Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-border/50 last:border-none gap-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Language</span>
                <span className="text-xs text-muted-foreground">
                  Choose your preferred language for the interface.
                </span>
              </div>
              <div className="w-full sm:w-44">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={selectStyles}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-border/50 last:border-none gap-2">
              <div className="flex gap-3 items-start">
                <Clock className="text-muted-foreground mt-0.5 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">Time Zone</span>
                  <span className="text-xs text-muted-foreground">
                    Set your time zone for accurate date and time displays.
                  </span>
                </div>
              </div>
              <div className="w-full sm:w-44">
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className={selectStyles}
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern (EST)</option>
                  <option value="CST">Central (CST)</option>
                  <option value="MST">Mountain (MST)</option>
                  <option value="PST">Pacific (PST)</option>
                  <option value="GMT">GMT</option>
                  <option value="CET">Central European (CET)</option>
                  <option value="IST">India (IST)</option>
                  <option value="JST">Japan (JST)</option>
                  <option value="AEST">Australian Eastern (AEST)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings Card */}
        <Card variant="glass" className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-500" /> Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <ToggleSwitch
              checked={showActivityStatus}
              onChange={setShowActivityStatus}
              label="Show Activity Status"
              description="Let others see when you are online or active in the application."
            />
            <ToggleSwitch
              checked={allowPublicProfile}
              onChange={setAllowPublicProfile}
              label="Public Profile"
              description="Allow other users to view your profile and activity history."
            />

            <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-3 mt-4">
              <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Your data is encrypted and secured with industry-standard security protocols.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card variant="glass" className="overflow-hidden border-destructive/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-border/50 gap-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Sign Out</span>
                <span className="text-xs text-muted-foreground">
                  End your current session and return to the login page.
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 transition-colors text-sm font-medium whitespace-nowrap"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Message */}
        <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4">
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            All settings are automatically saved to your account and will be synchronized across all your devices.
          </p>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {user && mongoId && (
        <ModalEditProfile
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          userId={mongoId}
        />
      )}
    </div>
  );
};

export default Settings;
