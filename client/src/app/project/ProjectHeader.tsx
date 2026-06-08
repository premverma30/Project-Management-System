import React from "react";
import { Grid3X3, List, Table, Clock, PlusSquare, Filter, Share2, Search } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/Button";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Project, useUpdateProjectStatusMutation, useGetAuthUserQuery } from "@/state/api";

type Props = {
  activeTab: string;
  setActiveTab: (tabName: string) => void;
  project?: Project;
};

const ProjectHeader = ({ activeTab, setActiveTab, project }: Props) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: authUser } = useGetAuthUserQuery(undefined);
  const [updateStatus] = useUpdateProjectStatusMutation();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!project) return;
    const newStatus = e.target.value;
    const projectId = project.id || (project as any)._id;
    if (projectId) {
      await updateStatus({ projectId, status: newStatus });
    }
  };

  const isOwner = authUser && project?.ownerId === (authUser.id || (authUser as any)._id);
  const projectName = project?.name || "Project";

  return (
    <div className="px-6 pb-6 pt-4">
      <div className="flex items-center justify-between pb-6">
        <Header name={projectName} />
        {project && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            {isOwner ? (
              <select
                value={project.status || "Active"}
                onChange={handleStatusChange}
                className="h-9 rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            ) : (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                project.status === "Completed" ? "bg-green-500/10 text-green-600 border border-green-500/20" :
                project.status === "Archived" ? "bg-muted text-muted-foreground border border-border" :
                "bg-blue-500/10 text-blue-600 border border-blue-500/20"
              }`}>
                {project.status || "Active"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="flex flex-wrap-reverse gap-4 border-b border-border pb-4 items-center">
        <div className="flex flex-1 items-center gap-1 overflow-x-auto no-scrollbar">
          <TabButton
            name="Board"
            icon={<Grid3X3 className="h-4 w-4" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="List"
            icon={<List className="h-4 w-4" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="Timeline"
            icon={<Clock className="h-4 w-4" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="Table"
            icon={<Table className="h-4 w-4" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-9 px-2 text-muted-foreground">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-9 px-2 text-muted-foreground">
            <Share2 className="h-4 w-4" />
          </Button>
          <div className="relative ml-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Task"
              className="h-9 w-[200px] rounded-full border border-border bg-muted/50 py-1 pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary dark:bg-muted/20 text-foreground placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

type TabButtonProps = {
  name: string;
  icon: React.ReactNode;
  setActiveTab: (tabName: string) => void;
  activeTab: string;
};

const TabButton = ({ name, icon, setActiveTab, activeTab }: TabButtonProps) => {
  const isActive = activeTab === name;

  return (
    <button
      className={`relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
      onClick={() => setActiveTab(name)}
    >
      {icon}
      {name}
    </button>
  );
};

export default ProjectHeader;
