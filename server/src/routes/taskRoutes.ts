import { Router } from "express";
import {
  getTasks,
  getUserTasks,
  updateTaskStatus,
  createTask,
} from "../controllers/taskController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getTasks);
router.post("/", protect, createTask);
router.patch("/:taskId/status", protect, updateTaskStatus);
router.get("/user/:userId", protect, getUserTasks);

export default router;
