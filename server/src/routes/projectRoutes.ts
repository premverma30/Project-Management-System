import { Router } from "express";
import { createProject, getProjects } from "../controllers/projectController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getProjects);
router.post("/", protect, createProject);

export default router;
