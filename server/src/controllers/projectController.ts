import type { Request, Response } from "express";
import Project from "../models/Project.js";
import { asyncHandler, ApiError } from "../middleware/errorHandler.js";

export const getProjects = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Not authorized");
    }
    
    // Only fetch projects the user owns or is a member of
    const filter: any = {
      $or: [{ ownerId: userId }, { members: userId }],
    };
    const projects = await Project.find(filter);
    res.json(projects);
  }
);

export const createProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, startDate, endDate, teamId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "Not authorized");
    }

    if (!name) {
      throw new ApiError(400, "Project name is required");
    }

    const newProject = await Project.create({
      name,
      description,
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ownerId: userId,
      ...(teamId && { teamId }),
      members: [userId],
    });
    res.status(201).json(newProject);
  }
);
