"use client";

import React, { useState } from "react";
import {
  Team,
  User,
  useGetTeamsQuery,
  useGetUsersQuery,
  useCreateTeamMutation,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useGetAuthUserQuery,
} from "@/state/api";
import Header from "@/components/Header";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Plus, UserPlus, UserMinus, Users, Crown, Shield } from "lucide-react";
import Image from "next/image";

/* ─── helpers ─────────────────────────────────────────── */
function resolveUser(val: string | User | undefined): User | undefined {
  if (!val) return undefined;
  if (typeof val === "object") return val;
  return undefined;
}

function MemberAvatar({ user }: { user: User }) {
  if (user.profilePictureUrl) {
    return (
      <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-background ring-1 ring-border">
        <Image src={user.profilePictureUrl} alt={user.username} fill className="object-cover" />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary/20 ring-1 ring-border text-xs font-bold text-primary">
      {user.username.charAt(0).toUpperCase()}
    </div>
  );
}

/* ─── Create Team Modal ────────────────────────────────── */
function CreateTeamModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [teamName, setTeamName] = useState("");
  const [createTeam, { isLoading }] = useCreateTeamMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    await createTeam({ teamName: teamName.trim() });
    setTeamName("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Team">
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <Input
          type="text"
          placeholder="Team name (required)"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          autoFocus
        />
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={!teamName.trim() || isLoading}
          isLoading={isLoading}
        >
          Create Team
        </Button>
      </form>
    </Modal>
  );
}

/* ─── Add Member Modal ─────────────────────────────────── */
function AddMemberModal({
  isOpen,
  onClose,
  team,
}: {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
}) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const { data: users } = useGetUsersQuery();
  const [addMember, { isLoading }] = useAddTeamMemberMutation();

  const teamId = team._id || team.teamId || "";
  const existingIds = new Set(
    (team.members ?? []).map((m) => m._id || m.userId || "")
  );
  const eligible = (users ?? []).filter((u) => !existingIds.has(u._id || u.userId || ""));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    await addMember({ teamId, userId: selectedUserId });
    setSelectedUserId("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Member to "${team.teamName}"`}>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {eligible.length === 0 ? (
          <p className="text-sm text-muted-foreground">All users are already members.</p>
        ) : (
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">Select a user…</option>
            {eligible.map((u) => (
              <option key={u._id || u.userId} value={u._id || u.userId}>
                {u.username} ({u.email})
              </option>
            ))}
          </select>
        )}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={!selectedUserId || isLoading}
          isLoading={isLoading}
        >
          Add Member
        </Button>
      </form>
    </Modal>
  );
}

/* ─── Team Card ────────────────────────────────────────── */
function TeamCard({ team, currentUserId }: { team: Team; currentUserId?: string }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [removeMember, { isLoading: removing }] = useRemoveTeamMemberMutation();

  const teamId = team._id || team.teamId || "";
  const owner = resolveUser(team.productOwnerUserId);
  const manager = resolveUser(team.projectManagerUserId);

  const isOwnerOrManager =
    currentUserId &&
    (owner?._id === currentUserId ||
      owner?.userId === currentUserId ||
      manager?._id === currentUserId ||
      manager?.userId === currentUserId);

  const handleRemove = async (userId: string) => {
    if (!window.confirm("Remove this member from the team?")) return;
    await removeMember({ teamId, userId });
  };

  return (
    <>
      <Card variant="glass" className="flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{team.teamName}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {(team.members ?? []).length} member{(team.members ?? []).length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          {isOwnerOrManager && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="shrink-0 flex items-center gap-1 text-xs text-primary hover:bg-primary/10"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add
            </Button>
          )}
        </CardHeader>

        <CardContent className="flex-1 space-y-3">
          {/* Roles */}
          {(owner || manager) && (
            <div className="flex flex-wrap gap-2">
              {owner && (
                <div className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                  <Crown className="h-3 w-3" />
                  {owner.username} (Owner)
                </div>
              )}
              {manager && manager._id !== owner?._id && (
                <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                  <Shield className="h-3 w-3" />
                  {manager.username} (Manager)
                </div>
              )}
            </div>
          )}

          {/* Member list */}
          <div className="space-y-2">
            {(team.members ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No members yet.</p>
            ) : (
              (team.members ?? []).map((member) => (
                <div
                  key={member._id || member.userId}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                >
                  <div className="flex items-center gap-2.5">
                    <MemberAvatar user={member} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.username}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  {isOwnerOrManager && (
                    <button
                      onClick={() => handleRemove(member._id || member.userId || "")}
                      disabled={removing}
                      className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Remove member"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Avatar stack preview */}
          {(team.members ?? []).length > 0 && (
            <div className="flex items-center pt-1">
              <div className="flex -space-x-2">
                {(team.members ?? []).slice(0, 5).map((m) => (
                  <MemberAvatar key={m._id || m.userId} user={m} />
                ))}
              </div>
              {(team.members ?? []).length > 5 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  +{(team.members ?? []).length - 5} more
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showAddModal && (
        <AddMemberModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          team={team}
        />
      )}
    </>
  );
}

/* ─── Teams Page ───────────────────────────────────────── */
const TeamsPage = () => {
  const { data: teams, isLoading, isError } = useGetTeamsQuery();
  const { data: authUser } = useGetAuthUserQuery(undefined);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const currentUserId =
    authUser?._id || (authUser as any)?.id || (authUser as any)?.userId || undefined;

  if (isLoading) {
    return (
      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-destructive bg-destructive/10 rounded-xl border border-destructive/20 m-8">
        Error loading teams. Please try refreshing.
      </div>
    );
  }

  return (
    <div className="h-full w-full px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Header name="Teams" />
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Team
        </Button>
      </div>

      {/* Empty state */}
      {(teams ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No teams yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first team to start collaborating.
          </p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Team
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teams!.map((team) => (
            <TeamCard
              key={team._id || team.teamId}
              team={team}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

      <CreateTeamModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
};

export default TeamsPage;
