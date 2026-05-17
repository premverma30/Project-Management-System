import type { Request, Response } from "express";
import Task from "../models/Task.js";
import Attachment from "../models/Attachment.js";
import mongoose from "mongoose";
import { asyncHandler, ApiError } from "../middleware/errorHandler.js";

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.query;

  const filter: any = {};
  if (projectId) {
    if (!mongoose.Types.ObjectId.isValid(projectId as string)) {
      res.json([]);
      return;
    }
    filter.projectId = projectId;
  }

  const tasks = await Task.find(filter)
    .populate("authorUserId", "username profilePictureUrl email")
    .populate("assignedUserId", "username profilePictureUrl email")
    .populate({
      path: "comments.userId",
      select: "username profilePictureUrl email",
    });

  // Batch-fetch all attachments in a single query instead of N+1
  const taskIds = tasks.map((t) => t._id);
  const allAttachments = await Attachment.find({ taskId: { $in: taskIds } });

  const attachmentsByTask = allAttachments.reduce(
    (acc: Record<string, typeof allAttachments>, att) => {
      const key = att.taskId.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(att);
      return acc;
    },
    {}
  );

  const tasksWithAttachments = tasks.map((task) => ({
    ...task.toObject(),
    attachments: attachmentsByTask[task._id.toString()] || [],
  }));

  res.json(tasksWithAttachments);
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const {
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    dueDate,
    points,
    projectId,
    authorUserId,
    assignedUserId,
  } = req.body;

  if (!title || !projectId || !authorUserId) {
    throw new ApiError(
      400,
      "Missing required fields: title, projectId, and authorUserId are required"
    );
  }

  const newTask = await Task.create({
    title,
    description,
    status,
    priority,
    tags,
    startDate: startDate ? new Date(startDate) : undefined,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    points,
    projectId,
    authorUserId,
    assignedUserId,
  });

  const populatedTask = await Task.findById(newTask._id)
    .populate("authorUserId", "username profilePictureUrl email")
    .populate("assignedUserId", "username profilePictureUrl email");

  res.status(201).json(populatedTask);
});

export const updateTaskStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new ApiError(400, "Invalid task ID");
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { status },
      { new: true }
    );

    if (!updatedTask) {
      throw new ApiError(404, "Task not found");
    }

    res.json(updatedTask);
  }
);

export const getUserTasks = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }

    const tasks = await Task.find({
      $or: [{ authorUserId: userId }, { assignedUserId: userId }],
    })
      .populate("authorUserId", "username profilePictureUrl email")
      .populate("assignedUserId", "username profilePictureUrl email");

    res.json(tasks);
  }
);
