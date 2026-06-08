import { Router } from "express";
import { getUsers, getUserById, updateUser } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getUsers);
router.get("/:userId", protect, getUserById);
router.patch("/:userId", protect, updateUser);

export default router;
