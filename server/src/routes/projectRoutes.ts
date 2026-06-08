import { Router } from "express";
import { createProject, getProjects, updateProjectStatus } from "../controllers/projectController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getProjects);
router.post("/", protect, createProject);
router.patch("/:projectId/status", protect, updateProjectStatus);

export default router;
