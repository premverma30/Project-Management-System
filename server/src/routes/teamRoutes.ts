import { Router } from "express";
import {
  getTeams,
  getTeamById,
  createTeam,
  addTeamMember,
  removeTeamMember,
} from "../controllers/teamController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getTeams);
router.get("/:teamId", protect, getTeamById);
router.post("/", protect, createTeam);
router.post("/:teamId/members", protect, addTeamMember);
router.delete("/:teamId/members/:userId", protect, removeTeamMember);

export default router;