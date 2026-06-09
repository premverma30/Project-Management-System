// import type { Request, Response } from "express";
// import mongoose from "mongoose";
// import Team from "../models/Team.js";
// import { asyncHandler, ApiError } from "../middleware/errorHandler.js";

// export const getTeams = asyncHandler(async (_req: Request, res: Response) => {
//   const teams = await Team.find()
//     .populate("members", "username email profilePictureUrl")
//     .populate("productOwnerUserId", "username email profilePictureUrl")
//     .populate("projectManagerUserId", "username email profilePictureUrl");
//   res.json(teams);
// });

// export const getTeamById = asyncHandler(async (req: Request, res: Response) => {
//   const { teamId } = req.params;
//   if (!mongoose.Types.ObjectId.isValid(teamId)) {
//     throw new ApiError(400, "Invalid team ID");
//   }
//   const team = await Team.findById(teamId)
//     .populate("members", "username email profilePictureUrl")
//     .populate("productOwnerUserId", "username email profilePictureUrl")
//     .populate("projectManagerUserId", "username email profilePictureUrl");
//   if (!team) throw new ApiError(404, "Team not found");
//   res.json(team);
// });

// export const createTeam = asyncHandler(async (req: Request, res: Response) => {
//   const { teamName } = req.body;
//   if (!teamName) throw new ApiError(400, "teamName is required");

//   const userId = req.user?.id;
//   const team = await Team.create({
//     teamName,
//     productOwnerUserId: userId,
//     members: [userId],
//   });
//   const populated = await Team.findById(team._id)
//     .populate("members", "username email profilePictureUrl")
//     .populate("productOwnerUserId", "username email profilePictureUrl");
//   res.status(201).json(populated);
// });

// export const addTeamMember = asyncHandler(async (req: Request, res: Response) => {
//   const { teamId } = req.params;
//   const { userId: memberUserId } = req.body;
//   const requesterId = req.user?.id;

//   if (!mongoose.Types.ObjectId.isValid(teamId)) throw new ApiError(400, "Invalid team ID");
//   if (!memberUserId || !mongoose.Types.ObjectId.isValid(memberUserId)) throw new ApiError(400, "Invalid user ID");

//   const team = await Team.findById(teamId);
//   if (!team) throw new ApiError(404, "Team not found");

//   const isOwnerOrManager =
//     team.productOwnerUserId?.toString() === requesterId ||
//     team.projectManagerUserId?.toString() === requesterId;
//   if (!isOwnerOrManager) {
//     throw new ApiError(403, "Only the product owner or project manager can add members");
//   }

//   const alreadyMember = team.members.some((m) => m.toString() === memberUserId);
//   if (alreadyMember) throw new ApiError(400, "User is already a member");

//   team.members.push(new mongoose.Types.ObjectId(memberUserId));
//   await team.save();

//   const updated = await Team.findById(teamId)
//     .populate("members", "username email profilePictureUrl")
//     .populate("productOwnerUserId", "username email profilePictureUrl")
//     .populate("projectManagerUserId", "username email profilePictureUrl");
//   res.json(updated);
// });

// export const removeTeamMember = asyncHandler(async (req: Request, res: Response) => {
//   const { teamId, userId: memberUserId } = req.params;
//   const requesterId = req.user?.id;

//   if (!mongoose.Types.ObjectId.isValid(teamId)) throw new ApiError(400, "Invalid team ID");
//   if (!mongoose.Types.ObjectId.isValid(memberUserId)) throw new ApiError(400, "Invalid user ID");

//   const team = await Team.findById(teamId);
//   if (!team) throw new ApiError(404, "Team not found");

//   const isOwnerOrManager =
//     team.productOwnerUserId?.toString() === requesterId ||
//     team.projectManagerUserId?.toString() === requesterId;
//   if (!isOwnerOrManager) {
//     throw new ApiError(403, "Only the product owner or project manager can remove members");
//   }

//   team.members = team.members.filter((m) => m.toString() !== memberUserId) as any;
//   await team.save();

//   const updated = await Team.findById(teamId)
//     .populate("members", "username email profilePictureUrl")
//     .populate("productOwnerUserId", "username email profilePictureUrl")
//     .populate("projectManagerUserId", "username email profilePictureUrl");
//   res.json(updated);
// });




import type { Request, Response } from "express";
import mongoose from "mongoose";
import Team from "../models/Team.js";
import { asyncHandler, ApiError } from "../middleware/errorHandler.js";

export const getTeams = asyncHandler(async (_req: Request, res: Response) => {
  const teams = await Team.find()
    .populate("members", "username email profilePictureUrl")
    .populate("projectManagerUserId", "username email profilePictureUrl");

  res.json(teams);
});

export const getTeamById = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;

  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new ApiError(400, "Invalid team ID");
  }

  const team = await Team.findById(teamId)
    .populate("members", "username email profilePictureUrl")
    .populate("productOwnerUserId", "username email profilePictureUrl")
    .populate("projectManagerUserId", "username email profilePictureUrl");

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  res.json(team);
});

export const createTeam = asyncHandler(async (req: Request, res: Response) => {
  const { teamName } = req.body;

  if (!teamName) {
    throw new ApiError(400, "teamName is required");
  }

  const userId = req.user?.id as string;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const team = await Team.create({
    teamName,
    productOwnerUserId: userId,
    members: [userId],
  });

  const populated = await Team.findById(team._id)
    .populate("members", "username email profilePictureUrl")
    .populate("productOwnerUserId", "username email profilePictureUrl");

  res.status(201).json(populated);
});

export const addTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const { userId: memberUserId } = req.body;
  const requesterId = req.user?.id as string;

  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new ApiError(400, "Invalid team ID");
  }

  if (!memberUserId || !mongoose.Types.ObjectId.isValid(memberUserId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const team = await Team.findById(teamId);

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  const isOwnerOrManager =
    team.productOwnerUserId?.toString() === requesterId ||
    team.projectManagerUserId?.toString() === requesterId;

  if (!isOwnerOrManager) {
    throw new ApiError(
      403,
      "Only the product owner or project manager can add members"
    );
  }

  const alreadyMember = team.members.some(
    (m) => m.toString() === memberUserId
  );

  if (alreadyMember) {
    throw new ApiError(400, "User is already a member");
  }

  team.members.push(new mongoose.Types.ObjectId(memberUserId));
  await team.save();

  const updated = await Team.findById(teamId)
    .populate("members", "username email profilePictureUrl")
    .populate("productOwnerUserId", "username email profilePictureUrl")
    .populate("projectManagerUserId", "username email profilePictureUrl");

  res.json(updated);
});

export const removeTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const memberUserId = req.params.userId as string;
  const requesterId = req.user?.id as string;

  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new ApiError(400, "Invalid team ID");
  }

  if (!mongoose.Types.ObjectId.isValid(memberUserId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const team = await Team.findById(teamId);

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  const isOwnerOrManager =
    team.productOwnerUserId?.toString() === requesterId ||
    team.projectManagerUserId?.toString() === requesterId;

  if (!isOwnerOrManager) {
    throw new ApiError(
      403,
      "Only the product owner or project manager can remove members"
    );
  }

  team.members = team.members.filter(
    (m) => m.toString() !== memberUserId
  ) as any;

  await team.save();

  const updated = await Team.findById(teamId)
    .populate("members", "username email profilePictureUrl")
    .populate("productOwnerUserId", "username email profilePictureUrl")
    .populate("projectManagerUserId", "username email profilePictureUrl");

  res.json(updated);
});