import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler, ApiError } from "../middleware/errorHandler.js";

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { googleId, email, username, profilePictureUrl } = req.body;

  // Log incoming payload for debugging (remove or reduce in production)
  console.log("[AuthController] POST /auth/google payload:", {
    googleId,
    email,
    username,
    profilePictureUrl,
  });

  if (!googleId || !email || !username) {
    console.error(
      "[AuthController] Missing required fields:",
      { googleIdPresent: !!googleId, emailPresent: !!email, usernamePresent: !!username }
    );
    throw new ApiError(400, "Missing required fields: googleId, email, username");
  }

  let user = await User.findOne({ googleId });

  if (!user) {
    // Try to find by email and attach googleId to existing account to avoid unique index conflicts
    user = await User.findOne({ email });
    if (user) {
      try {
        if (!user.googleId) {
          user.googleId = googleId;
          await user.save();
          console.log("[AuthController] Attached googleId to existing user by email:", email);
        }
      } catch (err) {
        console.error("[AuthController] Error attaching googleId to existing user:", err);
        throw new ApiError(500, "Failed to link Google account");
      }
    } else {
      // Create new user; ensure username uniqueness with a safe fallback
      let baseUsername = username || (email || "").split("@")[0] || "user";
      let candidate = baseUsername.replace(/\s+/g, "").toLowerCase();
      // If username already exists, append a short random suffix until unique
      let attempt = 0;
      while (await User.findOne({ username: candidate })) {
        attempt++;
        candidate = `${baseUsername}${Math.floor(Math.random() * 9000) + 1000}`.toLowerCase();
        if (attempt > 5) break;
      }

      try {
        user = await User.create({
          googleId,
          email,
          username: candidate,
          profilePictureUrl,
        });
      } catch (err: any) {
        console.error("[AuthController] Error creating user (retry fallback):", err);
        // Handle duplicate key errors more gracefully by returning existing user when possible
        if (err.code === 11000) {
          const existing = await User.findOne({ $or: [{ email }, { username: candidate }] });
          if (existing) {
            // If existing user by email found, attach googleId and continue
            if (!existing.googleId) {
              existing.googleId = googleId;
              await existing.save();
            }
            user = existing;
          } else {
            throw new ApiError(500, "Failed to create user due to duplicate key");
          }
        } else {
          throw new ApiError(500, "Failed to create user");
        }
      }
    }
  }

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
  });

  res.json({ token, user });
});

export const getMe = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user.id).select("-googleId");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.json(user);
});
