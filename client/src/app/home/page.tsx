"use client";

import {
  Priority,
  Project,
  Task,
  useGetProjectsQuery,
  useGetTasksQuery,
} from "@/state/api";
import React from "react";
import { useSession } from "next-auth/react";
import { useAppSelector } from "../redux";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Header from "@/components/Header";
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
  { field: "title", headerName: "Title", width: 200 },
  { field: "status", headerName: "Status", width: 150, renderCell: (params) => (
    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold leading-5 text-primary border border-primary/20 mt-3">
      {params.value}
    </span>
  )},
  { field: "priority", headerName: "Priority", width: 150, renderCell: (params) => {
    let classes = "";
    switch (params.value) {
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
      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider mt-3 ${classes}`}>
        {params.value}
      </span>
    );
  } },
  { field: "dueDate", headerName: "Due Date", width: 150 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const HomePage = () => {
  const { data: session } = useSession();
  const userId = (session as any)?.mongoId;

  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useGetTasksQuery({ projectId: "" }, { skip: false }); 
  
  const { data: projects, isLoading: isProjectsLoading } =
    useGetProjectsQuery();

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

  if (tasksError || !tasks || !projects) {
    return (
      <div className="h-full w-full px-6 py-8 flex items-center justify-center">
        <div className="p-8 text-center text-destructive font-medium bg-destructive/10 rounded-xl border border-destructive/20">
          Error fetching dashboard data. Please try again later.
        </div>
      </div>
    );
  }

  const priorityCount = tasks.reduce(
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

  const statusCount = projects.reduce(
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

  const chartColors = isDarkMode
    ? {
        bar: "#60a5fa",
        barGrid: "#2d3135",
        pieFill: "#3b82f6",
        text: "#9ca3af",
        tooltipBg: "#1d1f21",
        tooltipBorder: "#2d3135"
      }
    : {
        bar: "#3b82f6",
        barGrid: "#e5e7eb",
        pieFill: "#3b82f6",
        text: "#4b5563",
        tooltipBg: "#ffffff",
        tooltipBorder: "#e5e7eb"
      };

  return (
    <div className="h-full w-full px-6 py-8">
      <Header name="Project Management Dashboard" />
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-6">
        <Card variant="glass" className="overflow-hidden">
          <CardHeader>
            <CardTitle>Task Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.barGrid} vertical={false} />
                <XAxis dataKey="name" stroke={chartColors.text} tickLine={false} axisLine={false} />
                <YAxis stroke={chartColors.text} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: chartColors.tooltipBg, 
                    border: `1px solid ${chartColors.tooltipBorder}`, 
                    borderRadius: "8px",
                    color: isDarkMode ? "#fff" : "#000"
                  }} 
                  cursor={{fill: isDarkMode ? '#2d3135' : '#f3f4f6'}}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="count" fill={chartColors.bar} radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card variant="glass" className="overflow-hidden">
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  dataKey="count" 
                  data={projectStatus} 
                  fill={chartColors.pieFill} 
                  labelLine={false}
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {projectStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: chartColors.tooltipBg, 
                    border: `1px solid ${chartColors.tooltipBorder}`, 
                    borderRadius: "8px",
                    color: isDarkMode ? "#fff" : "#000"
                  }} 
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card variant="glass" className="overflow-hidden md:col-span-2">
          <CardHeader>
            <CardTitle>Your Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full rounded-xl border border-border bg-card overflow-hidden">
              <DataGrid
                rows={tasks || []}
                columns={taskColumns}
                checkboxSelection
                loading={tasksLoading}
                getRowId={(row) => row._id || row.id}
                className={`${dataGridClassNames} !border-none`}
                sx={dataGridSxStyles(isDarkMode)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
 