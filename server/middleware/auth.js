import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

export const authMiddleware = (req, res, next) => {
  let token = req.cookies?.session_token;

  // Fallback to Bearer token in Authorization header for cross-domain Vercel <-> Render API calls
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No session token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Store decoded user info in request
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Session token is invalid or expired' });
  }
};
