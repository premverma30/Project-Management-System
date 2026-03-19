import type { Request, Response } from "express";
import { prisma } from "../client.js";

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.query;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: Number(projectId),
      },
      include: {
        author: true,
        assignee: true,
        comments: true,
        attachments: true,
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving tasks: ${error.message}` });
  }
};


export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
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

  // Validate required fields
  if (!title || !projectId || !authorUserId) {
    res.status(400).json({ 
      message: "Missing required fields: title, projectId, and authorUserId are required" 
    });
    return;
  }

  try {
    // Build data object with only provided fields
    const data: any = {
      title,
      projectId: Number(projectId),
      authorUserId: Number(authorUserId),
    };

    // Add optional fields only if they're provided
    if (description) data.description = description;
    if (status) data.status = status;
    if (priority) data.priority = priority;
    if (tags) data.tags = tags;
    if (startDate) data.startDate = new Date(startDate);
    if (dueDate) data.dueDate = new Date(dueDate);
    if (points) data.points = Number(points);
    if (assignedUserId) data.assignedUserId = Number(assignedUserId);

    const newTask = await prisma.task.create({
      data,
      include: {
        author: true,
        assignee: true,
      },
    });
    res.status(201).json(newTask);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating a task: ${error.message}` });
  }
};

export const updateTaskStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;
  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        status: status,
      },
    });
    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: `Error updating task: ${error.message}` });
  }
};

export const getUserTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { authorUserId: Number(userId) },
          { assignedUserId: Number(userId) },
        ],
      },
      include: {
        author: true,
        assignee: true,
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving user's tasks: ${error.message}` });
  }
};
