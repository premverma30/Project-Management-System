import type { Request, Response } from "express";
import Team from "../models/Team.js";

export const getTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving teams: ${error.message}` });
  }
};
