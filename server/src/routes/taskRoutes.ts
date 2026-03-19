import { Router } from "express";
import { getTasks,
  getUserTasks,
  updateTaskStatus,
  createTask
} from "../controllers/taskController.js";

const router = Router();

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:taskId/status", updateTaskStatus);
router.get("/user/:userId", getUserTasks);

export default router;
