"use client";

import React, { useState, use } from "react";
import ProjectHeader from "../ProjectHeader";
import Board from "../BoardView";
import List from "../ListView";
import Timeline from "../TimelineView";
import Table from "../TableView";
import ModalNewTask from "@/components/ModalNewTask";

import { useGetProjectsQuery } from "@/state/api";

type Props = {
  params: Promise<{ id: string }>;
};

const Project = ({ params }: Props) => {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("Board");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  const { data: projects } = useGetProjectsQuery();
  const project = projects?.find((p) => p._id === id || p.id === id);
  const projectName = project?.name || "Project";

  return (
    <div>
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        id={id}
      />
      <ProjectHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        projectName={projectName}
      />
      {activeTab === "Board" && (
        <Board id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "List" && (
        <List id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "Timeline" && (
        <Timeline id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "Table" && (
        <Table id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
    </div>
  );
};

export default Project;
