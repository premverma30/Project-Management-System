import type { Request, Response } from "express";
import Project from "../models/Project.js";

export const getProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving projects: ${error.message}` });
  }
};

export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, description, startDate, endDate } = req.body;
  try {
    const newProject = await Project.create({
      name,
      description,
      startDate,
      endDate,
    });
    res.status(201).json(newProject);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating a project: ${error.message}` });
  }
};
