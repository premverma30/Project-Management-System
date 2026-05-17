import { Router } from "express";
import { getTeams } from "../controllers/teamController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getTeams);

export default router;