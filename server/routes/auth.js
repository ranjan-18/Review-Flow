import express from 'express';
import { login, logout, getMe, forgotPassword } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.post('/forgot-password', loginLimiter, forgotPassword);
router.get('/me', authMiddleware, getMe);

export default router;
