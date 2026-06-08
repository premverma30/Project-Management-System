"use client";
import { useGetUsersQuery, useGetTeamsQuery } from "@/state/api";
import React, { useState, useMemo } from "react";
import { useAppSelector } from "../redux";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Search,
  Users as UsersIcon,
  Mail,
  MapPin,
  Filter,
  ChevronRight,
  Shield,
  MoreVertical,
  UserCheck,
  Clock,
} from "lucide-react";

// Profile Picture Component
const ProfilePicture = ({ url, username, size = "large" }: { url?: string; username: string; size?: "large" | "small" }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = size === "large" ? "h-24 w-24" : "h-16 w-16";
  const iconSize = size === "large" ? "h-10 w-10" : "h-8 w-8";

  const getImageUrl = (profileUrl: string) => {
    if (!profileUrl) return null;
    // Check if it's already a full URL
    if (profileUrl.startsWith("http")) return profileUrl;
    // Otherwise, construct the S3 URL
    return `https://pm-s3-images.s3.us-east-2.amazonaws.com/${profileUrl}`;
  };

  const imageUrl = url && !imageError ? getImageUrl(url) : null;

  return (
    <div className={`relative ${sizeClasses} overflow-hidden rounded-full border-4 border-primary bg-muted`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={username}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <UsersIcon className={`${iconSize} text-muted-foreground`} />
        </div>
      )}
    </div>
  );
};

// User Status Modal Component
const UserDetailModal = ({ user, isOpen, onClose }: { user: any; isOpen: boolean; onClose: () => void }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-background p-6 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">User Profile</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-muted transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* User Avatar */}
          <div className="flex justify-center">
            <ProfilePicture url={user.profilePictureUrl} username={user.username} size="large" />
          </div>

          {/* User Info */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">{user.username}</h3>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
              <UserCheck className="h-4 w-4 text-green-500" />
              Active
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* User Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">User ID</p>
                <p className="text-sm font-mono text-foreground">{user._id?.substring(0, 12)}...</p>
              </div>
            </div>

            {user.teamId && (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Team</p>
                  <p className="text-sm font-medium text-foreground">{user.teamId}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Account Status</p>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Active</p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// User Card Component
const UserCard = ({ user, onViewDetails }: { user: any; onViewDetails: (user: any) => void }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card className="group hover:shadow-md transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative h-20 bg-gradient-to-r from-primary/20 to-blue-500/20" />
        
        <div className="px-4 pb-4">
          {/* Avatar */}
          <div className="flex items-start justify-between -mt-10 mb-3">
            <div className="border-4 border-background rounded-full">
              <ProfilePicture url={user.profilePictureUrl} username={user.username} size="small" />
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">Active</span>
            </div>
          </div>

          {/* User Info */}
          <div className="mb-3">
            <h3 className="font-semibold text-foreground text-sm truncate">{user.username}</h3>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </p>
          </div>

          {/* Team Info */}
          {user.teamId ? (
            <div className="mb-3 text-xs bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded inline-block">
              Team: {String(user.teamId).substring(0, 8)}...
            </div>
          ) : (
            <div className="mb-3 text-xs bg-gray-500/10 border border-gray-500/20 text-gray-600 dark:text-gray-400 px-2 py-1 rounded inline-block">
              No team assigned
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => onViewDetails(user)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors group/btn"
          >
            <span className="text-sm font-medium">View Profile</span>
            <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

const Users = () => {
  const { data: users, isLoading } = useGetUsersQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("username");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    let filtered = users.filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort users
    if (sortBy === "username") {
      filtered.sort((a, b) => a.username.localeCompare(b.username));
    } else if (sortBy === "email") {
      filtered.sort((a, b) => a.email.localeCompare(b.email));
    }

    return filtered;
  }, [users, searchTerm, sortBy]);

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  if (isLoading) {
    return (
      <div className="px-6 py-8">
        <Header name="Users" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 h-full overflow-y-auto">
      <Header name="Users" />

      <div className="mt-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{users?.length || 0}</p>
                </div>
                <div className="rounded-lg bg-blue-500/20 p-3">
                  <UsersIcon className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{users?.length || 0}</p>
                </div>
                <div className="rounded-lg bg-green-500/20 p-3">
                  <UserCheck className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">With Teams</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {users?.filter((u) => u.teamId).length || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-purple-500/20 p-3">
                  <UsersIcon className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unassigned</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {users?.filter((u) => !u.teamId).length || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-amber-500/20 p-3">
                  <Shield className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background transition-colors"
                />
              </div>

              {/* Sort Options */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                >
                  <option value="username">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                </select>

                <div className="ml-auto text-sm text-muted-foreground">
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredUsers.map((user) => (
              <UserCard
                key={user._id || user.userId}
                user={user}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <Card variant="glass">
            <CardContent className="py-16 text-center">
              <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No users found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
      />
    </div>
  );
};

export default Users;
