"use client";

import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import ModalNewTask from "@/components/ModalNewTask";
import TaskCard from "@/components/TaskCard";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import {
  Priority,
  Task,
  useGetAuthUserQuery,
  useGetTasksByUserQuery,
} from "@/state/api";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";

type Props = {
  priority: Priority;
};

const columns: GridColDef[] = [
  {
    field: "title",
    headerName: "Title",
    width: 200,
  },
  {
    field: "description",
    headerName: "Description",
    width: 300,
  },
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
    }
  },
  {
    field: "tags",
    headerName: "Tags",
    width: 150,
  },
  {
    field: "startDate",
    headerName: "Start Date",
    width: 130,
  },
  {
    field: "dueDate",
    headerName: "Due Date",
    width: 130,
  },
  {
    field: "author",
    headerName: "Author",
    width: 150,
    renderCell: (params) => params.value?.username || "Unknown",
  },
  {
    field: "assignee",
    headerName: "Assignee",
    width: 150,
    renderCell: (params) => params.value?.username || "Unassigned",
  },
];

const ReusablePriorityPage = ({ priority }: Props) => {
  const [view, setView] = useState("list");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  const { data: currentUser, isLoading: isUserLoading } = useGetAuthUserQuery({});
  const userId = currentUser?.userDetails?.userId || currentUser?.userDetails?._id;

  const {
    data: tasks,
    isLoading: isTasksLoading,
    isError: isTasksError,
  } = useGetTasksByUserQuery(userId ?? "", {
    skip: !userId,
  });

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const filteredTasks = tasks?.filter(
    (task: Task) => task.priority === priority,
  );

  const isLoading = isUserLoading || isTasksLoading;

  if (isTasksError) {
    return (
      <div className="h-full w-full px-6 py-8 flex items-center justify-center">
        <div className="p-8 text-center text-destructive font-medium bg-destructive/10 rounded-xl border border-destructive/20">
          Error fetching tasks. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full px-6 py-8">
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
      />
      
      <div className="pb-4">
        <Header
          name={`${priority} Priority Tasks`}
          buttonComponent={
            <Button
              variant="primary"
              onClick={() => setIsModalNewTaskOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          }
        />
      </div>

      <div className="mb-6 flex overflow-hidden rounded-md border border-input bg-muted/30 p-1 w-fit">
        <button
          className={`flex-1 rounded-sm px-4 py-1.5 text-sm font-medium transition-all ${
            view === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setView("list")}
        >
          List View
        </button>
        <button
          className={`flex-1 rounded-sm px-4 py-1.5 text-sm font-medium transition-all ${
            view === "table" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setView("table")}
        >
          Table View
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} variant="glass" className="h-[250px]">
              <CardContent className="p-5 flex flex-col h-full justify-between">
                <div>
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-5/6 mb-4" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : view === "list" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTasks?.length === 0 ? (
             <div className="col-span-full p-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-border">
               No tasks found with {priority} priority.
             </div>
          ) : (
            filteredTasks?.map((task: Task) => (
              <TaskCard key={task._id || task.id} task={task} />
            ))
          )}
        </div>
      ) : (
        view === "table" && (
          <div className="h-[600px] w-full rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <DataGrid
              rows={filteredTasks || []}
              columns={columns}
              checkboxSelection
              getRowId={(row) => row._id || row.id}
              className={`${dataGridClassNames} !border-none`}
              sx={dataGridSxStyles(isDarkMode)}
            />
          </div>
        )
      )}
    </div>
  );
};

export default ReusablePriorityPage;
