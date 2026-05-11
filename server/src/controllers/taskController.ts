import type { Request, Response } from "express";
import Task from "../models/Task.js";
import Attachment from "../models/Attachment.js";

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.query;
  try {
    const tasks = await Task.find({ projectId })
      .populate('authorUserId', 'username profilePictureUrl email')
      .populate('assignedUserId', 'username profilePictureUrl email')
      .populate({
        path: 'comments.userId',
        select: 'username profilePictureUrl email'
      });
    
    // To include attachments, we might need a separate query or virtuals if they were set up.
    // For now, let's just fetch them if needed or assume they are fetched separately in the frontend.
    // However, the prompt specifically asked for .populate('attachments').
    // Since Attachment is a separate collection, we'll populate it.
    
    const tasksWithAttachments = await Promise.all(tasks.map(async (task) => {
        const attachments = await Attachment.find({ taskId: task._id });
        return { ...task.toObject(), attachments };
    }));

    res.json(tasksWithAttachments);
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

  if (!title || !projectId || !authorUserId) {
    res.status(400).json({ 
      message: "Missing required fields: title, projectId, and authorUserId are required" 
    });
    return;
  }

  try {
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
      .populate('authorUserId', 'username profilePictureUrl email')
      .populate('assignedUserId', 'username profilePictureUrl email');

    res.status(201).json(populatedTask);
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
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { status },
      { new: true }
    );
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
    const tasks = await Task.find({
      $or: [
        { authorUserId: userId },
        { assignedUserId: userId },
      ],
    })
    .populate('authorUserId', 'username profilePictureUrl email')
    .populate('assignedUserId', 'username profilePictureUrl email');
    
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving user's tasks: ${error.message}` });
  }
};
