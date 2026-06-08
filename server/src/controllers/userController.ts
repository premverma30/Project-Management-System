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

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { username, email, teamId } = req.body;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId as string)) {
    throw new ApiError(400, "Invalid user ID");
  }

  // Ensure users can only update their own profile
  const requesterId = req.user?.id ? String(req.user.id) : undefined;
  if (!requesterId || userId !== requesterId) {
    throw new ApiError(403, "Not authorized to update this user profile");
  }

  const updateData: any = {};
  if (username !== undefined) {
    // Validate username uniqueness
    const existingUser = await User.findOne({ username, _id: { $ne: userId } });
    if (existingUser) {
      throw new ApiError(400, "Username already taken");
    }
    updateData.username = username;
  }

  if (email !== undefined) {
    // Validate email uniqueness
    const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
    if (existingEmail) {
      throw new ApiError(400, "Email already in use");
    }
    updateData.email = email;
  }

  if (teamId !== undefined) {
    updateData.teamId = teamId ? new mongoose.Types.ObjectId(teamId) : null;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true }
  ).select("-googleId");

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  res.json(updatedUser);
});
