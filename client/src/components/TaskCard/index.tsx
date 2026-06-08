import { Task, useDeleteTaskMutation } from "@/state/api";
import { format } from "date-fns";
import Image from "next/image";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Trash2, Edit2 } from "lucide-react";
import ModalEditTask from "../ModalEditTask";

type Props = {
  task: Task;
};

const TaskCard = ({ task }: Props) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteTask] = useDeleteTaskMutation();

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      const taskId = task.id || (task as any)._id;
      if (taskId) {
        await deleteTask(taskId);
      }
    }
  };

  return (
    <Card variant="glass" className="overflow-hidden hover:shadow-md transition-shadow h-full">
      {task.attachments && task.attachments.length > 0 && (
        <div className="relative h-48 w-full">
          <Image
            src={`https://pm-s3-images.s3.us-east-2.amazonaws.com/${task.attachments[0].fileURL}`}
            alt={task.attachments[0].fileName}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardContent className="p-5 flex flex-col h-full">
        <div className="mb-3 flex flex-wrap gap-2">
          {task.priority && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              task.priority === "Urgent" ? "bg-destructive/10 text-destructive border-destructive/20 border" :
              task.priority === "High" ? "bg-orange-500/10 text-orange-500 border-orange-500/20 border" :
              task.priority === "Medium" ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 border dark:text-yellow-400" :
              "bg-green-500/10 text-green-600 border-green-500/20 border dark:text-green-400"
            }`}>
              {task.priority}
            </span>
          )}
          {task.status && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary border border-primary/20">
              {task.status}
            </span>
          )}
        </div>

        <div className="flex justify-between items-start">
          <h3 className="mb-2 text-base font-semibold leading-tight text-foreground">
            {task.title}
          </h3>
          <div className="flex items-center">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="text-muted-foreground hover:text-blue-500 transition-colors ml-2"
              title="Edit task"
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={handleDelete}
              className="text-muted-foreground hover:text-destructive transition-colors ml-2"
              title="Delete task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <p className="mb-4 text-sm text-muted-foreground line-clamp-3 flex-grow">
          {task.description || "No description provided"}
        </p>

        <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex flex-col gap-1">
              <span className="font-medium">Dates</span>
              <span>
                {task.startDate ? format(new Date(task.startDate), "MMM d") : "-"} to {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "-"}
              </span>
            </div>
            {task.tags && (
              <div className="flex gap-1 flex-wrap justify-end max-w-[50%]">
                {(Array.isArray(task.tags)
                  ? task.tags.flatMap((tag) => tag.split(","))
                  : String(task.tags).split(",")
                ).map((tag: string, idx: number) => (
                  <span key={idx} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground">Assignee</span>
                <span className="text-xs font-medium text-foreground">
                  {task.assignee ? task.assignee.username : "Unassigned"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-right">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground">Author</span>
                <span className="text-xs font-medium text-foreground">
                  {task.author ? task.author.username : "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <ModalEditTask 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
      />
    </Card>
  );
};

export default TaskCard;
