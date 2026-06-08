"use client";

import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Priority, Status, Task, useUpdateTaskMutation, useGetUsersQuery } from "@/state/api";
import React, { useState, useEffect } from "react";
import { formatISO } from "date-fns";
import { useSession } from "next-auth/react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
};

const ModalEditTask = ({ isOpen, onClose, task }: Props) => {
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const { data: users } = useGetUsersQuery();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>(Status.ToDo);
  const [priority, setPriority] = useState<Priority>(Priority.Backlog);
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus(task.status as Status || Status.ToDo);
      setPriority(task.priority as Priority || Priority.Backlog);
      setTags(
        task.tags
          ? Array.isArray(task.tags)
            ? task.tags.join(", ")
            : String(task.tags)
          : ""
      );
      setStartDate(task.startDate ? task.startDate.split("T")[0] : "");
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
      
      let initialAssigneeId = "";
      if (task.assignedUserId) {
        initialAssigneeId = typeof task.assignedUserId === "string" ? task.assignedUserId : (task.assignedUserId as any)._id;
      } else if (task.assignee) {
        initialAssigneeId = (task.assignee as any)._id || (task.assignee as any).id || "";
      }
      setAssignedUserId(initialAssigneeId);
    }
  }, [task, isOpen]);

  const handleSubmit = async () => {
    if (!title || !task) return;

    const formattedStartDate = startDate
      ? formatISO(new Date(startDate), { representation: "complete" })
      : undefined;
    const formattedDueDate = dueDate
      ? formatISO(new Date(dueDate), { representation: "complete" })
      : undefined;

    const taskId = task.id || (task as any)._id;
    if (!taskId) return;

    await updateTask({
      taskId,
      taskData: {
        title,
        description,
        status,
        priority,
        tags,
        startDate: formattedStartDate,
        dueDate: formattedDueDate,
        assignedUserId: assignedUserId || undefined,
      }
    });

    onClose();
  };

  const isFormValid = (): boolean => {
    return !!title;
  };

  const selectStyles =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors";

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
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
              setStatus(e.target.value as Status)
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
              setPriority(e.target.value as Priority)
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

        {/* Assignee dropdown */}
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

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={!isFormValid() || isLoading}
            isLoading={isLoading}
          >
            Update Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalEditTask;
