import type { Request, Response } from "express";
import Task from "../models/Task.js";
import Attachment from "../models/Attachment.js";
import mongoose from "mongoose";
import { asyncHandler, ApiError } from "../middleware/errorHandler.js";
import Project from "../models/Project.js";

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.query;

  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Not authorized");
  }

  const filter: any = {};
  if (projectId) {
    if (!mongoose.Types.ObjectId.isValid(projectId as string)) {
      throw new ApiError(400, "Invalid project ID");
    }
    
    // Verify user has access to this project
    const projectFilter: any = {
      _id: projectId,
      $or: [{ ownerId: userId }, { members: userId }],
    };
    const project = await Project.findOne(projectFilter);
    
    if (!project) {
      throw new ApiError(403, "Not authorized to view tasks for this project");
    }
    
    filter.projectId = projectId;
  } else {
    // If no project specified, only fetch tasks the user authored or is assigned to
    filter.$or = [{ authorUserId: userId }, { assignedUserId: userId }];
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

  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Not authorized");
  }

  if (!title || !projectId) {
    throw new ApiError(
      400,
      "Missing required fields: title and projectId are required"
    );
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  // Author is always the logged in user
  const finalAuthorUserId = userId;

  // Validate assignee if provided
  if (assignedUserId && !mongoose.Types.ObjectId.isValid(assignedUserId)) {
    throw new ApiError(400, "Invalid assigned user ID");
  }

  // Check if user has access to add tasks to this project
  const projectFilter: any = {
    _id: projectId,
    $or: [{ ownerId: userId }, { members: userId }],
  };
  const project = await Project.findOne(projectFilter);

  if (!project) {
    throw new ApiError(403, "Not authorized to add tasks to this project");
  }

  const newTask = await Task.create({
    title,
    ...(description && { description }),
    ...(status && { status }),
    ...(priority && { priority }),
    ...(tags && { tags }),
    ...(startDate && { startDate: new Date(startDate) }),
    ...(dueDate && { dueDate: new Date(dueDate) }),
    ...(points && { points }),
    projectId,
    authorUserId: finalAuthorUserId,
    ...(assignedUserId && { assignedUserId }),
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

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId as string)) {
      throw new ApiError(400, "Invalid task ID");
    }

    const task = await Task.findById(taskId);
    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    // Optional: add ownership check for updates
    const userId = req.user?.id;
    if (task.authorUserId.toString() !== userId && task.assignedUserId?.toString() !== userId) {
      // If not author or assignee, verify they are in the project
      const projectFilter: any = {
        _id: task.projectId,
        $or: [{ ownerId: userId }, { members: userId }],
      };
      const project = await Project.findOne(projectFilter);
      if (!project) {
        throw new ApiError(403, "Not authorized to update this task");
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { status },
      { new: true }
    );

    res.json(updatedTask);
  }
);

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const userId = req.user?.id;

  if (!taskId || !mongoose.Types.ObjectId.isValid(taskId as string)) {
    throw new ApiError(400, "Invalid task ID");
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Authorization check
  if (task.authorUserId.toString() !== userId && task.assignedUserId?.toString() !== userId) {
    const projectFilter: any = {
      _id: task.projectId,
      $or: [{ ownerId: userId }, { members: userId }],
    };
    const project = await Project.findOne(projectFilter);
    if (!project || project.ownerId.toString() !== userId) {
       // Only the author, assignee, or project owner can delete
       throw new ApiError(403, "Not authorized to delete this task");
    }
  }

  await Task.findByIdAndDelete(taskId);
  res.status(200).json({ message: "Task deleted successfully" });
});

export const getUserTasks = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId as string)) {
      throw new ApiError(400, "Invalid user ID");
    }

    // Ensure users can only query their own tasks unless they have admin rights (omitted for brevity)
    if (userId !== req.user?.id) {
      throw new ApiError(403, "Not authorized to view other user's tasks");
    }

    const userTasksFilter: any = {
      $or: [{ authorUserId: userId }, { assignedUserId: userId }],
    };
    const tasks = await Task.find(userTasksFilter)
      .populate("authorUserId", "username profilePictureUrl email")
      .populate("assignedUserId", "username profilePictureUrl email");

    res.json(tasks);
  }
);
