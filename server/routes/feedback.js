import express from 'express';
import { getFeedbacks, getConversions, createFeedback, createConversion, updateFeedbackStatus } from '../controllers/feedbackController.js';
import { authMiddleware } from '../middleware/auth.js';
import { submissionLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Public customer submission endpoints (rate limited)
router.post('/submit', submissionLimiter, createFeedback);
router.post('/convert', submissionLimiter, createConversion);

// Authenticated Admin endpoints
router.get('/', authMiddleware, getFeedbacks);
router.get('/conversions', authMiddleware, getConversions);
router.put('/:id/status', authMiddleware, updateFeedbackStatus);

export default router;
