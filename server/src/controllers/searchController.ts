import type { Request, Response } from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { asyncHandler, ApiError } from "../middleware/errorHandler.js";

/**
 * Escapes special regex characters to prevent ReDoS attacks.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const search = asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.query;

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    throw new ApiError(400, "Search query is required");
  }

  const sanitized = escapeRegex(query.trim());

  const [tasks, projects, users] = await Promise.all([
    Task.find({
      $or: [
        { title: { $regex: sanitized, $options: "i" } },
        { description: { $regex: sanitized, $options: "i" } },
      ],
    })
      .populate("authorUserId", "username profilePictureUrl email")
      .populate("assignedUserId", "username profilePictureUrl email"),
    Project.find({
      $or: [
        { name: { $regex: sanitized, $options: "i" } },
        { description: { $regex: sanitized, $options: "i" } },
      ],
    }),
    User.find({
      $or: [
        { username: { $regex: sanitized, $options: "i" } },
        { email: { $regex: sanitized, $options: "i" } },
      ],
    }).select("-googleId"),
  ]);

  res.json({ tasks, projects, users });
});
