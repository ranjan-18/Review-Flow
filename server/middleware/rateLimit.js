import rateLimit from 'express-rate-limit';

// General API rate limiter: max 1000 requests per 15 minutes (allows polling and active editing)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, 
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for public submissions (feedback & conversions): max 50 submissions per 15 minutes
export const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50, 
  message: { error: 'Submission limit reached from this IP. Please wait before submitting more feedback.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for login attempts: max 50 login attempts per 15 minutes
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50, 
  message: { error: 'Too many login attempts. Please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
