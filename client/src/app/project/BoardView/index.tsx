import { useGetTasksQuery, useUpdateTaskStatusMutation } from "@/state/api";
import React from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task as TaskType } from "@/state/api";
import { EllipsisVertical, MessageSquareMore, Plus } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type BoardProps = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const taskStatus = ["To Do", "Work In Progress", "Under Review", "Completed"];

const BoardView = ({ id, setIsModalNewTaskOpen }: BoardProps) => {
  const {
    data: tasks,
    isLoading,
    error,
  } = useGetTasksQuery({ projectId: id });
  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  const moveTask = (taskId: string, toStatus: string) => {
    updateTaskStatus({ taskId, status: toStatus });
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading board...</div>;
  if (error) return <div className="p-8 text-center text-destructive">An error occurred while fetching tasks</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 xl:grid-cols-4 h-full overflow-y-auto">
        {taskStatus.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasks || []}
            moveTask={moveTask}
            setIsModalNewTaskOpen={setIsModalNewTaskOpen}
          />
        ))}
      </div>
    </DndProvider>
  );
};

type TaskColumnProps = {
  status: string;
  tasks: TaskType[];
  moveTask: (taskId: string, toStatus: string) => void;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const TaskColumn = ({
  status,
  tasks,
  moveTask,
  setIsModalNewTaskOpen,
}: TaskColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: string }) => moveTask(item.id, status),
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const tasksCount = tasks.filter((task) => task.status === status).length;

  const statusColor: any = {
    "To Do": "hsl(var(--primary))",
    "Work In Progress": "hsl(var(--destructive))", // Using destructive color temporarily as alternative to orange
    "Under Review": "#eab308", // Yellow
    Completed: "#10b981", // Emerald
  };

  return (
    <div
      ref={(instance) => {
        drop(instance);
      }}
      className={`flex flex-col gap-4 rounded-xl transition-colors ${
        isOver ? "bg-muted/50" : ""
      }`}
    >
      <div className="flex items-center justify-between rounded-xl bg-card p-4 shadow-sm border border-border">
        <div className="flex items-center gap-3">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: statusColor[status] }}
          />
          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            {status}
          </h3>
          <span className="flex h-5 items-center justify-center rounded-full bg-muted px-2 text-xs font-medium text-muted-foreground">
            {tasksCount}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 pb-4">
        {tasks
          .filter((task) => task.status === status)
          .map((task) => (
            <Task key={task._id || task.id} task={task} />
          ))}
      </div>
    </div>
  );
};

type TaskProps = {
  task: TaskType;
};

const Task = ({ task }: TaskProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task._id || task.id },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const taskTagsSplit = task.tags ? task.tags.split(",") : [];

  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "MMM d")
    : "";
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "MMM d")
    : "";

  const numberOfComments = (task.comments && task.comments.length) || 0;

  const PriorityTag = ({ priority }: { priority: TaskType["priority"] }) => {
    let classes = "";
    switch (priority) {
      case "Urgent":
        classes = "bg-destructive/10 text-destructive border-destructive/20";
        break;
      case "High":
        classes = "bg-orange-500/10 text-orange-500 border-orange-500/20";
        break;
      case "Medium":
        classes = "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400";
        break;
      case "Low":
        classes = "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400";
        break;
      default:
        classes = "bg-muted text-muted-foreground border-border";
    }

    return (
      <div className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${classes}`}>
        {priority}
      </div>
    );
  };

  return (
    <div
      ref={(instance) => {
        drag(instance);
      }}
      className={`cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <Card variant="glass" className="overflow-hidden hover:shadow-md transition-shadow">
        {task.attachments && task.attachments.length > 0 && (
          <div className="relative h-32 w-full">
            <Image
              src={`https://pm-s3-images.s3.us-east-2.amazonaws.com/${task.attachments[0].fileURL}`}
              alt={task.attachments[0].fileName}
              fill
              className="object-cover"
            />
          </div>
        )}
        <CardContent className="p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {task.priority && <PriorityTag priority={task.priority} />}
            {taskTagsSplit.map((tag) => (
              <div
                key={tag}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider"
              >
                {tag}
              </div>
            ))}
          </div>

          <h4 className="mb-1 text-sm font-semibold leading-tight text-foreground line-clamp-2">
            {task.title}
          </h4>
          
          <p className="mb-4 text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex -space-x-2 overflow-hidden">
              {task.assignee && (
                <Image
                  key={task.assignee.userId}
                  src={`https://pm-s3-images.s3.us-east-2.amazonaws.com/${task.assignee.profilePictureUrl!}`}
                  alt={task.assignee.username}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full border-2 border-card object-cover"
                />
              )}
              {task.author && (
                <Image
                  key={task.author.userId}
                  src={`https://pm-s3-images.s3.us-east-2.amazonaws.com/${task.author.profilePictureUrl!}`}
                  alt={task.author.username}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full border-2 border-card object-cover"
                />
              )}
            </div>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
              {(formattedStartDate || formattedDueDate) && (
                <span className="flex items-center gap-1">
                  {formattedDueDate || formattedStartDate}
                </span>
              )}
              <div className="flex items-center gap-1">
                <MessageSquareMore className="h-3.5 w-3.5" />
                <span>{numberOfComments}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BoardView;
