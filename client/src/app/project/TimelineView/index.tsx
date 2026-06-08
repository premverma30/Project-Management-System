import { useAppSelector } from "@/app/redux";
import { useGetTasksQuery } from "@/state/api";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Plus, ListTodo, Clock, CheckCircle, Calendar } from "lucide-react";
import { format } from "date-fns";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

type TaskTypeItems = "task" | "milestone" | "project";

const CustomTooltip = ({ task }: { task: any }) => {
  const startStr = format(task.start, "MMM d, yyyy");
  const endStr = format(task.end, "MMM d, yyyy");
  return (
    <div className="rounded-xl border border-border bg-popover/95 p-4 shadow-xl backdrop-blur-md text-popover-foreground w-64 space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Timeline Item</span>
        <span className="text-xs font-semibold text-muted-foreground">{task.progress.toFixed(0)}% Progress</span>
      </div>
      <h4 className="text-sm font-semibold text-foreground leading-snug break-words">{task.name}</h4>
      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/50">
        <div>
          <span className="text-[10px] text-muted-foreground block font-medium">Start</span>
          <span className="font-semibold text-foreground">{startStr}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block font-medium">End</span>
          <span className="font-semibold text-foreground">{endStr}</span>
        </div>
      </div>
    </div>
  );
};

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
        .map((task, index) => {
          let barColor = "#3b82f6"; // Blue (default/Low)
          let progressColor = "#1d4ed8";
          
          if (task.status === "Completed") {
            barColor = "#10b981"; // Green
            progressColor = "#047857";
          } else if (task.priority === "Urgent") {
            barColor = "#ef4444"; // Red
            progressColor = "#b91c1c";
          } else if (task.priority === "High") {
            barColor = "#f97316"; // Orange
            progressColor = "#c2410c";
          } else if (task.priority === "Medium") {
            barColor = "#eab308"; // Yellow
            progressColor = "#a16207";
          }
          
          return {
            start: new Date(task.startDate as string),
            end: new Date(task.dueDate as string),
            name: task.title,
            id: `Task-${index}-${task._id ?? task.id ?? "item"}`,
            type: "task" as TaskTypeItems,
            progress: task.points ? (task.points / 10) * 100 : 0,
            isDisabled: false,
            styles: {
              backgroundColor: isDarkMode ? `${barColor}20` : `${barColor}15`,
              backgroundSelectedColor: isDarkMode ? `${barColor}30` : `${barColor}25`,
              progressColor: barColor,
              progressSelectedColor: progressColor,
            }
          };
        }) || []
    );
  }, [tasks, isDarkMode]);

  // Calculations for Summary Cards
  const totalTasks = ganttTasks.length;
  const completedTasks = tasks?.filter((t) => t.status === "Completed").length || 0;
  const avgProgress = totalTasks
    ? Math.round(ganttTasks.reduce((sum, t) => sum + t.progress, 0) / totalTasks)
    : 0;

  const earliestDate = ganttTasks.length
    ? new Date(Math.min(...ganttTasks.map((t) => t.start.getTime())))
    : null;
  const latestDate = ganttTasks.length
    ? new Date(Math.max(...ganttTasks.map((t) => t.end.getTime())))
    : null;
  const timeSpanDays = earliestDate && latestDate
    ? Math.ceil((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading timeline...</div>;
  if (error || !tasks) return <div className="p-8 text-center text-destructive">An error occurred while fetching tasks</div>;

  return (
    <div className="px-6 pb-8">
      {/* HEADER SECTION */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-5">
        <h1 className="text-lg font-bold text-foreground">
          Project Tasks Timeline
        </h1>
        
        {/* VIEW SEGMENT CONTROL */}
        <div className="flex overflow-hidden rounded-md border border-input bg-muted/30 p-1 w-fit">
          <button
            type="button"
            className={`rounded-sm px-4 py-1.5 text-sm font-medium transition-all ${
              displayOptions.viewMode === ViewMode.Day
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setDisplayOptions((prev) => ({ ...prev, viewMode: ViewMode.Day }))}
          >
            Day
          </button>
          <button
            type="button"
            className={`rounded-sm px-4 py-1.5 text-sm font-medium transition-all ${
              displayOptions.viewMode === ViewMode.Week
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setDisplayOptions((prev) => ({ ...prev, viewMode: ViewMode.Week }))}
          >
            Week
          </button>
          <button
            type="button"
            className={`rounded-sm px-4 py-1.5 text-sm font-medium transition-all ${
              displayOptions.viewMode === ViewMode.Month
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setDisplayOptions((prev) => ({ ...prev, viewMode: ViewMode.Month }))}
          >
            Month
          </button>
        </div>
      </div>

      {/* SUMMARY WIDGETS */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <Card variant="glass" className="p-4 flex items-center justify-between border-white/5 dark:bg-black/10">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Scheduled</span>
            <span className="text-2xl font-bold text-foreground leading-none">{totalTasks}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <ListTodo className="h-5 w-5" />
          </div>
        </Card>
        
        <Card variant="glass" className="p-4 flex items-center justify-between border-white/5 dark:bg-black/10">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Avg Progress</span>
            <span className="text-2xl font-bold text-foreground leading-none">{avgProgress}%</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock className="h-5 w-5" />
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex items-center justify-between border-white/5 dark:bg-black/10">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Completed</span>
            <span className="text-2xl font-bold text-foreground leading-none">{completedTasks}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle className="h-5 w-5" />
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex items-center justify-between border-white/5 dark:bg-black/10">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Project Span</span>
            <span className="text-2xl font-bold text-foreground leading-none">
              {timeSpanDays} <span className="text-xs text-muted-foreground font-normal">days</span>
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Calendar className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* GANTT CHART CONTAINER */}
      <div className="overflow-hidden rounded-xl bg-card border border-border shadow-sm">
        <div className="timeline w-full overflow-x-auto">
          <Gantt
            tasks={ganttTasks}
            {...displayOptions}
            columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
            listCellWidth="200px"
            barBackgroundColor={isDarkMode ? "#1e293b" : "#f1f5f9"}
            barBackgroundSelectedColor={isDarkMode ? "#334155" : "#e2e8f0"}
            barProgressColor={isDarkMode ? "#3b82f6" : "#2563eb"}
            barProgressSelectedColor={isDarkMode ? "#60a5fa" : "#1d4ed8"}
            projectBackgroundColor={isDarkMode ? "#1f2937" : "#e5e7eb"}
            projectProgressColor={isDarkMode ? "#10b981" : "#059669"}
            projectProgressSelectedColor={isDarkMode ? "#34d399" : "#047857"}
            projectBackgroundSelectedColor={isDarkMode ? "#374151" : "#d1d5db"}
            milestoneBackgroundColor={isDarkMode ? "#f43f5e" : "#e11d48"}
            milestoneBackgroundSelectedColor={isDarkMode ? "#fb7185" : "#be123c"}
            arrowColor={isDarkMode ? "#475569" : "#cbd5e1"}
            todayColor={isDarkMode ? "rgba(59, 130, 246, 0.15)" : "rgba(37, 99, 235, 0.08)"}
            fontFamily="inherit"
            fontSize="12px"
            barCornerRadius={4}
            barFill={45}
            rowHeight={40}
            TooltipContent={CustomTooltip}
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
