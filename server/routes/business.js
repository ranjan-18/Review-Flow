import express from 'express';
import { getBusinesses, getPublicBusiness, createBusiness, updateBusiness, deleteBusiness, incrementScan } from '../controllers/businessController.js';
import { authMiddleware } from '../middleware/auth.js';
import { submissionLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Public routes (rate limited)
router.get('/public/:id', submissionLimiter, getPublicBusiness);
router.post('/public/:id/scan', submissionLimiter, incrementScan);

// Authenticated Admin routes
router.get('/', authMiddleware, getBusinesses);
router.post('/', authMiddleware, createBusiness);
router.put('/:id', authMiddleware, updateBusiness);
router.delete('/:id', authMiddleware, deleteBusiness);

export default router;
