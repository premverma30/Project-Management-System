import type { Request, Response } from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

export const search = async (req: Request, res: Response): Promise<void> => {
  const { query } = req.query;
  try {
    const tasks = await Task.find({
      $or: [
        { title: { $regex: query as string, $options: "i" } },
        { description: { $regex: query as string, $options: "i" } },
      ],
    });

    const projects = await Project.find({
      $or: [
        { name: { $regex: query as string, $options: "i" } },
        { description: { $regex: query as string, $options: "i" } },
      ],
    });

    const users = await User.find({
      $or: [
        { username: { $regex: query as string, $options: "i" } },
        { email: { $regex: query as string, $options: "i" } },
      ],
    }).select("-googleId");

    res.json({ tasks, projects, users });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error performing search: ${error.message}` });
  }
};
