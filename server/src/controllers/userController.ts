import type { Request, Response } from "express";
import User from "../models/User.js";
import { asyncHandler, ApiError } from "../middleware/errorHandler.js";
import mongoose from "mongoose";

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find().select("-googleId");
  res.json(users);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId as string)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(userId).select("-googleId");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.json(user);
});
