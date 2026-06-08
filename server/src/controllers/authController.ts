import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler, ApiError } from "../middleware/errorHandler.js";

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { googleId, email, username, profilePictureUrl } = req.body;

  if (!googleId || !email || !username) {
    throw new ApiError(400, "Missing required fields: googleId, email, username");
  }

  let user = await User.findOne({ googleId });

  if (!user) {
    user = await User.create({
      googleId,
      email,
      username,
      profilePictureUrl,
    });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any }
  );

  res.json({ token, user });
});

export const getMe = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user.id).select("-googleId");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.json(user);
});
