import React from "react";
import Header from "@/components/Header";
import TaskCard from "@/components/TaskCard";
import { Task, useGetTasksQuery } from "@/state/api";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const ListView = ({ id, setIsModalNewTaskOpen }: Props) => {
  const {
    data: tasks,
    error,
    isLoading,
  } = useGetTasksQuery({ projectId: id });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading list...</div>;
  if (error) return <div className="p-8 text-center text-destructive">An error occurred while fetching tasks</div>;

  return (
    <div className="px-6 pb-8">
      <div className="pt-5 pb-4">
        <Header
          name="List"
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tasks?.map((task: Task) => <TaskCard key={task._id || task.id} task={task} />)}
      </div>
    </div>
  );
};

export default ListView;
