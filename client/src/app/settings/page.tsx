import Header from "@/components/Header";
import React from "react";
import { Card, CardContent } from "@/components/ui/Card";

const Settings = () => {
  const userSettings = {
    username: "johndoe",
    email: "john.doe@example.com",
    teamName: "Development Team",
    roleName: "Developer",
  };

  const labelStyles = "text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1";
  const containerStyles = "space-y-1";

  return (
    <div className="px-6 py-8">
      <Header name="Settings" />
      
      <div className="mt-8 max-w-2xl">
        <Card variant="glass" className="overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground tracking-tight">Account Information</h2>
              <p className="text-sm text-muted-foreground">Manage your profile details and settings.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className={containerStyles}>
                <label className={labelStyles}>Username</label>
                <div className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-foreground select-none">
                  {userSettings.username}
                </div>
              </div>
              
              <div className={containerStyles}>
                <label className={labelStyles}>Email Address</label>
                <div className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-foreground select-none">
                  {userSettings.email}
                </div>
              </div>

              <div className={containerStyles}>
                <label className={labelStyles}>Team</label>
                <div className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-foreground select-none">
                  {userSettings.teamName}
                </div>
              </div>

              <div className={containerStyles}>
                <label className={labelStyles}>Role</label>
                <div className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-foreground select-none">
                  {userSettings.roleName}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
