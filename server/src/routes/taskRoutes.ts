import { Router } from "express";
import {
  getTasks,
  deleteTask,
  getUserTasks,
  updateTaskStatus,
  updateTask,
  createTask,
} from "../controllers/taskController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getTasks);
router.post("/", protect, createTask);
router.patch("/:taskId", protect, updateTask);
router.patch("/:taskId/status", protect, updateTaskStatus);
router.delete("/:taskId", protect, deleteTask);
router.get("/user/:userId", protect, getUserTasks);

export default router;
