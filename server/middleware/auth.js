import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

export const authMiddleware = (req, res, next) => {
  const token = req.cookies?.session_token;

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
