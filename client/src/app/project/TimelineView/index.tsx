import { useAppSelector } from "@/app/redux";
import { useGetTasksQuery } from "@/state/api";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

type TaskTypeItems = "task" | "milestone" | "project";

const Timeline = ({ id, setIsModalNewTaskOpen }: Props) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const {
    data: tasks,
    error,
    isLoading,
  } = useGetTasksQuery({ projectId: id });

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  const ganttTasks = useMemo(() => {
    return (
      tasks
        ?.filter((task) => task.startDate && task.dueDate)
        .map((task, index) => ({
          start: new Date(task.startDate as string),
          end: new Date(task.dueDate as string),
          name: task.title,
          id: `Task-${index}-${task._id ?? task.id ?? "item"}`,
          type: "task" as TaskTypeItems,
          progress: task.points ? (task.points / 10) * 100 : 0,
          isDisabled: false,
        })) || []
    );
  }, [tasks]);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading timeline...</div>;
  if (error || !tasks) return <div className="p-8 text-center text-destructive">An error occurred while fetching tasks</div>;

  return (
    <div className="px-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-2 py-5">
        <h1 className="me-2 text-lg font-bold text-foreground">
          Project Tasks Timeline
        </h1>
        <div className="relative inline-block w-64">
          <select
            className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            value={displayOptions.viewMode}
            onChange={handleViewModeChange}
          >
            <option value={ViewMode.Day}>Day</option>
            <option value={ViewMode.Week}>Week</option>
            <option value={ViewMode.Month}>Month</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-card border border-border shadow-sm">
        <div className="timeline w-full overflow-x-auto">
          <Gantt
            tasks={ganttTasks}
            {...displayOptions}
            columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
            listCellWidth="100px"
            barBackgroundColor={isDarkMode ? "hsl(var(--primary))" : "hsl(var(--primary))"}
            barBackgroundSelectedColor={isDarkMode ? "hsl(var(--primary)/0.8)" : "hsl(var(--primary)/0.8)"}
          />
        </div>
        <div className="p-5 border-t border-border">
          <Button
            variant="primary"
            onClick={() => setIsModalNewTaskOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Task
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
