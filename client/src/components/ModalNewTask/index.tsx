"use client";

import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Priority, Status, useCreateTaskMutation, useGetUsersQuery } from "@/state/api";
import React, { useState } from "react";
import { formatISO } from "date-fns";
import { useSession } from "next-auth/react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null;
};

const ModalNewTask = ({ isOpen, onClose, id = null }: Props) => {
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const { data: session } = useSession();
  const { data: users } = useGetUsersQuery();

  // CRIT-02 FIX: authorUserId is no longer a text field that users type into.
  // It is derived directly from the authenticated session's MongoDB _id.
  // This prevents impersonation and guarantees the correct author is always set.
  const authorUserId = (session as any)?.mongoId as string | undefined;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>(Status.ToDo);
  const [priority, setPriority] = useState<Priority>(Priority.Backlog);
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [projectId, setProjectId] = useState("");

  const handleSubmit = async () => {
    if (!title || !authorUserId || !(id !== null || projectId)) return;

    const formattedStartDate = startDate
      ? formatISO(new Date(startDate), { representation: "complete" })
      : undefined;
    const formattedDueDate = dueDate
      ? formatISO(new Date(dueDate), { representation: "complete" })
      : undefined;

    await createTask({
      title,
      description,
      status,
      priority,
      tags,
      startDate: formattedStartDate,
      dueDate: formattedDueDate,
      // CRIT-02: comes from session, never from user input
      authorUserId,
      assignedUserId: assignedUserId || undefined,
      projectId: id !== null ? id : projectId,
    });

    // Reset form and close
    onClose();
    setTitle("");
    setDescription("");
    setTags("");
    setStartDate("");
    setDueDate("");
    setAssignedUserId("");
    setProjectId("");
    setStatus(Status.ToDo);
    setPriority(Priority.Backlog);
  };

  // CRIT-03 FIX: Previous logic was inverted — !(id !== null || projectId)
  // returned false when project context existed, disabling the button always.
  // Corrected: the form is valid when title, author, and project are all present.
  const isFormValid = (): boolean => {
    return !!(title && authorUserId && (id !== null || !!projectId));
  };

  const selectStyles =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form
        className="mt-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Input
          type="text"
          placeholder="Task title (required)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <select
            className={selectStyles}
            value={status}
            onChange={(e) =>
              setStatus(Status[e.target.value as keyof typeof Status])
            }
          >
            <option value={Status.ToDo}>To Do</option>
            <option value={Status.WorkInProgress}>Work In Progress</option>
            <option value={Status.UnderReview}>Under Review</option>
            <option value={Status.Completed}>Completed</option>
          </select>

          <select
            className={selectStyles}
            value={priority}
            onChange={(e) =>
              setPriority(Priority[e.target.value as keyof typeof Priority])
            }
          >
            <option value={Priority.Urgent}>Urgent</option>
            <option value={Priority.High}>High</option>
            <option value={Priority.Medium}>Medium</option>
            <option value={Priority.Low}>Low</option>
            <option value={Priority.Backlog}>Backlog</option>
          </select>
        </div>

        <Input
          type="text"
          placeholder="Tags (comma separated, optional)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground pl-1">Start Date</span>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground pl-1">Due Date</span>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Assignee dropdown — populated from real users, not a raw ID field */}
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground pl-1">Assign To (optional)</span>
          <select
            className={selectStyles}
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {users?.map((user) => (
              <option key={user._id || user.userId} value={user._id || user.userId}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {/* Show project ID field only when not called from a project page */}
        {id === null && (
          <Input
            type="text"
            placeholder="Project ID (required if not in project)"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          />
        )}

        {/* Author info — read-only display, not an editable field */}
        {authorUserId && (
          <p className="text-xs text-muted-foreground pl-1">
            Author: <span className="font-medium text-foreground">{session?.user?.name}</span>
          </p>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={!isFormValid() || isLoading}
            isLoading={isLoading}
          >
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalNewTask;
