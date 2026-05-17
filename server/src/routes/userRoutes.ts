import { Router } from "express";
import { getUsers, getUserById } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getUsers);
router.get("/:userId", protect, getUserById);

export default router;
