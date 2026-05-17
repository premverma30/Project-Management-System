import type { Request, Response } from "express";
import Team from "../models/Team.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getTeams = asyncHandler(async (_req: Request, res: Response) => {
  const teams = await Team.find();
  res.json(teams);
});
