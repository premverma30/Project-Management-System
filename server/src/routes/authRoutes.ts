import { Router } from 'express';
import { googleAuth, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/google', googleAuth);
router.get('/me', protect, getMe);

export default router;
