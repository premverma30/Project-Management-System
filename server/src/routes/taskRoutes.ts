import { Router } from "express";
import {
  deleteTask,
  getUserTasks,
  updateTaskStatus,
  createTask,
} from "../controllers/taskController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getTasks);
router.post("/", protect, createTask);
router.delete("/:taskId", protect, deleteTask);
router.get("/user/:userId", protect, getUserTasks);

export default router;
