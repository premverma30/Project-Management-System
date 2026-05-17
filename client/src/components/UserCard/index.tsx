import { User } from "@/state/api";
import Image from "next/image";
import React from "react";
import { Card, CardContent } from "@/components/ui/Card";

type Props = {
  user: User;
};

const UserCard = ({ user }: Props) => {
  return (
    <Card variant="glass" className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center gap-3">
        {user.profilePictureUrl ? (
          <Image
            src={`https://pm-s3-images.s3.us-east-2.amazonaws.com/${user.profilePictureUrl}`}
            alt={user.username}
            width={40}
            height={40}
            className="rounded-full object-cover border border-border"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
            {user.username.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {user.username}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {user.email}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
