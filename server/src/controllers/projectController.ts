import type { Request, Response } from "express";
import Project from "../models/Project.js";
import { asyncHandler, ApiError } from "../middleware/errorHandler.js";
import mongoose from "mongoose";

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

export const updateProjectStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId as string)) {
      throw new ApiError(400, "Invalid project ID");
    }

    if (!["Active", "Completed", "Archived"].includes(status)) {
      throw new ApiError(400, "Invalid status. Must be Active, Completed, or Archived.");
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // Only the project owner can change the status
    if (project.ownerId.toString() !== userId) {
      throw new ApiError(403, "Only the project owner can change the project status");
    }

    project.status = status;
    await project.save();

    res.json(project);
  }
);
