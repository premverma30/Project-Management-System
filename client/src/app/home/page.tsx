"use client";

import {
  Priority,
  Project,
  Task,
  useGetProjectsQuery,
  useGetTasksByUserQuery,
} from "@/state/api";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useAppSelector } from "../redux";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Header from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { PlusSquare } from "lucide-react";
import ModalNewTask from "@/components/ModalNewTask";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

const taskColumns: GridColDef[] = [
  { field: "title", headerName: "Title", width: 200, flex: 1 },
  {
    field: "status",
    headerName: "Status",
    width: 150,
    renderCell: (params) => (
      <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold leading-5 text-primary border border-primary/20 mt-3">
        {params.value}
      </span>
    ),
  },
  {
    field: "priority",
    headerName: "Priority",
    width: 130,
    renderCell: (params) => {
      const map: Record<string, string> = {
        Urgent: "bg-destructive/10 text-destructive border-destructive/20",
        High: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        Medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400",
        Low: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
      };
      const classes = map[params.value] ?? "bg-muted text-muted-foreground border-border";
      return (
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider mt-3 ${classes}`}
        >
          {params.value}
        </span>
      );
    },
  },
  {
    field: "dueDate",
    headerName: "Due Date",
    width: 130,
    valueFormatter: (value: string) =>
      value ? new Date(value).toLocaleDateString() : "—",
  },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const HomePage = () => {
  const { data: session } = useSession();
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  // CRIT-04 FIX: Previously used useGetTasksQuery({ projectId: "" }) which fetched
  // ALL tasks from the entire database — a privacy violation and performance issue.
  // Now uses useGetTasksByUserQuery with the session's mongoId so each user only
  // sees tasks they authored or were assigned to.
  const userId = (session as any)?.mongoId as string | undefined;

  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useGetTasksByUserQuery(userId ?? "", { skip: !userId });

  const { data: projects, isLoading: isProjectsLoading } = useGetProjectsQuery();

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (tasksLoading || isProjectsLoading) {
    return (
      <div className="h-full w-full px-6 py-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Skeleton className="h-[350px] w-full rounded-xl" />
        <Skeleton className="h-[350px] w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl md:col-span-2" />
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="h-full w-full px-6 py-8 flex items-center justify-center">
        <div className="p-8 text-center text-destructive font-medium bg-destructive/10 rounded-xl border border-destructive/20">
          Error loading your tasks. Please try refreshing the page.
        </div>
      </div>
    );
  }

  // Build chart data from real tasks
  const priorityCount = (tasks ?? []).reduce(
    (acc: Record<string, number>, task: Task) => {
      const { priority } = task;
      if (priority) {
        acc[priority as Priority] = (acc[priority as Priority] || 0) + 1;
      }
      return acc;
    },
    {},
  );

  const taskDistribution = Object.keys(priorityCount).map((key) => ({
    name: key,
    count: priorityCount[key],
  }));

  // Project status: infer Active/Completed from endDate presence
  const statusCount = (projects ?? []).reduce(
    (acc: Record<string, number>, project: Project) => {
      const status = project.endDate ? "Completed" : "Active";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {},
  );

  const projectStatus = Object.keys(statusCount).map((key) => ({
    name: key,
    count: statusCount[key],
  }));

  // Generate Activity Feed from recent tasks
  const recentActivities = [...(tasks || [])]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || "").getTime() - new Date(a.updatedAt || a.createdAt || "").getTime())
    .slice(0, 5)
    .map(task => ({
      id: task._id || task.id,
      title: task.title,
      status: task.status,
      author: task.author ? task.author.username : "Someone",
      time: new Date(task.updatedAt || task.createdAt || "").toLocaleDateString()
    }));

  const chartColors = isDarkMode
    ? {
        bar: "#60a5fa",
        barGrid: "#2d3135",
        text: "#9ca3af",
        tooltipBg: "#1d1f21",
        tooltipBorder: "#2d3135",
      }
    : {
        bar: "#3b82f6",
        barGrid: "#e5e7eb",
        text: "#4b5563",
        tooltipBg: "#ffffff",
        tooltipBorder: "#e5e7eb",
      };

  const tooltipContentStyle = {
    backgroundColor: chartColors.tooltipBg,
    border: `1px solid ${chartColors.tooltipBorder}`,
    borderRadius: "8px",
    color: isDarkMode ? "#fff" : "#000",
  };

  return (
    <div className="h-full w-full px-6 py-8">
      <div className="flex items-center justify-between">
        <Header name="Dashboard" />
        <Button
          onClick={() => setIsModalNewTaskOpen(true)}
          className="flex items-center rounded bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90"
        >
          <PlusSquare className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-6">
        {/* Task Priority Distribution */}
        <Card variant="glass" className="overflow-hidden">
          <CardHeader>
            <CardTitle>My Task Priority</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {taskDistribution.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No tasks found
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taskDistribution}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={chartColors.barGrid}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke={chartColors.text}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={chartColors.text}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    cursor={{ fill: isDarkMode ? "#2d3135" : "#f3f4f6" }}
                  />
                  <Bar
                    dataKey="count"
                    fill={chartColors.bar}
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Project Status */}
        <Card variant="glass" className="overflow-hidden">
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {projectStatus.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No projects found
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    dataKey="count"
                    data={projectStatus}
                    labelLine={false}
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {projectStatus.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipContentStyle} />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card variant="glass" className="overflow-hidden md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-sm text-muted-foreground">No recent activity.</div>
              ) : (
                recentActivities.map((activity, idx) => (
                  <div key={activity.id || idx} className="flex items-start gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0 mt-1">
                      {activity.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{activity.author}</span> updated task <span className="font-medium text-primary">"{activity.title}"</span>
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{activity.time}</span>
                        <span>•</span>
                        <span className="rounded-full bg-muted px-2 py-0.5">{activity.status}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Your Tasks table — scoped to current user */}
        <Card variant="glass" className="overflow-hidden md:col-span-2">
          <CardHeader>
            <CardTitle>
              Your Tasks
              {tasks && tasks.length > 0 && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-normal text-primary">
                  {tasks.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full rounded-xl border border-border overflow-hidden">
              <DataGrid
                rows={tasks ?? []}
                columns={taskColumns}
                checkboxSelection
                loading={tasksLoading}
                getRowId={(row) => row._id ?? row.id}
                className={`${dataGridClassNames} !bg-transparent !border-none`}
                sx={dataGridSxStyles(isDarkMode)}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                pageSizeOptions={[5, 10, 25]}
                disableRowSelectionOnClick
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;