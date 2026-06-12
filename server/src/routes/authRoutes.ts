import { Router } from 'express';
import { googleAuth, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

// Generous rate limit for auth syncing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: { success: false, message: 'Too many auth requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const router = Router();

// Debug middleware to log requests that actually reach the Node.js server
router.use((req, res, next) => {
  console.log(`[Backend AuthRouter] Received ${req.method} ${req.originalUrl}`);
  // If the request reached here, we want to log if it gets rate limited or successful
  res.on('finish', () => {
    console.log(`[Backend AuthRouter] Responding to ${req.originalUrl} with status: ${res.statusCode}`);
  });
  next();
});

router.post('/google', authLimiter, googleAuth);
router.get('/me', protect, getMe);

export default router;
