import type { Request, Response } from "express";
import Project from "../models/Project.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getProjects = asyncHandler(
  async (_req: Request, res: Response) => {
    const projects = await Project.find();
    res.json(projects);
  }
);

export const createProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, startDate, endDate } = req.body;
    const newProject = await Project.create({
      name,
      description,
      startDate,
      endDate,
    });
    res.status(201).json(newProject);
  }
);
