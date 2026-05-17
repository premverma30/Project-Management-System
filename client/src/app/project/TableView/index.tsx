import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { useGetTasksQuery } from "@/state/api";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React from "react";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
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

const TableView = ({ id, setIsModalNewTaskOpen }: Props) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const {
    data: tasks,
    error,
    isLoading,
  } = useGetTasksQuery({ projectId: id });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading table...</div>;
  if (error || !tasks) return <div className="p-8 text-center text-destructive">An error occurred while fetching tasks</div>;

  return (
    <div className="h-[600px] w-full px-6 pb-8">
      <div className="pt-5 pb-4">
        <Header
          name="Table"
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
          isSmallText
        />
      </div>
      <div className="h-full w-full rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <DataGrid
          rows={tasks || []}
          columns={columns}
          getRowId={(row) => row._id || row.id}
          className={`${dataGridClassNames} !border-none`}
          sx={dataGridSxStyles(isDarkMode)}
        />
      </div>
    </div>
  );
};

export default TableView;
