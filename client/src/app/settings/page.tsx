"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useGetAuthUserQuery } from "@/state/api";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { User, Mail, Users, Shield } from "lucide-react";
import Image from "next/image";

// CRIT-05 FIX: Settings page previously showed 100% hardcoded fake data
// ("johndoe", "john.doe@example.com", "Development Team", "Developer").
// Now pulls real data from the NextAuth session and the backend /users/:id endpoint.

const Settings = () => {
  const { data: session } = useSession();
  const { data: user, isLoading } = useGetAuthUserQuery(undefined);

  const labelStyles =
    "text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1";
  const valueStyles =
    "flex h-10 w-full items-center rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-foreground select-none";

  if (isLoading) {
    return (
      <div className="px-6 py-8">
        <Header name="Settings" />
        <div className="mt-8 max-w-2xl space-y-4">
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Display name: prefer backend username, fall back to Google display name
  const displayName = user?.username || session?.user?.name || "—";
  const email = user?.email || session?.user?.email || "—";
  // MongoDB _id from session token
  const mongoId = (session as any)?.mongoId as string | undefined;

  return (
    <div className="px-6 py-8">
      <Header name="Settings" />

      <div className="mt-8 max-w-2xl space-y-6">
        {/* Profile Card */}
        <Card variant="glass" className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-5 border-b border-border pb-5">
              {/* Avatar */}
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

            {/* Account Details Grid */}
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
                    {/* Google color dot */}
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Google OAuth
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences note */}
        <p className="text-xs text-muted-foreground">
          Profile information is managed through your Google account.
          Dark mode and sidebar preferences are saved locally.
        </p>
      </div>
    </div>
  );
};

export default Settings;
