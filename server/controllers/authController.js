import jwt from 'jsonwebtoken';
import { JWT_SECRET, ADMIN_USER, ADMIN_PASS, NODE_ENV } from '../config/env.js';
import { db } from '../db/db.js';

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Validate admin credentials from environment variables
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Generate JWT token
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });

    // Set cookie with sameSite: 'none' and secure: true for cross-domain Vercel <-> Render session support
    res.cookie('session_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.json({ success: true, message: 'Logged in successfully', user: { username, role: 'admin' } });
  }

  // Validate business owner credentials from database
  try {
    const businesses = await db.getBusinesses();
    const matchedBiz = businesses.find(b => b.ownerUsername === username && b.ownerPassword === password);
    
    if (matchedBiz) {
      // Generate JWT token carrying owner role and specific businessId
      const token = jwt.sign(
        { username, role: 'owner', businessId: matchedBiz.id },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.cookie('session_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: 'Logged in successfully as Shop Owner',
        user: { username, role: 'owner', businessId: matchedBiz.id }
      });
    }
  } catch (err) {
    console.error('Owner auth database check failed', err);
  }

  return res.status(401).json({ error: 'Invalid username or password' });
};

export const logout = async (req, res) => {
  res.clearCookie('session_token', { httpOnly: true, secure: true, sameSite: 'none' });
  return res.json({ success: true, message: 'Logged out successfully' });
};

export const forgotPassword = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username or account ID is required' });
  }

  if (username === ADMIN_USER) {
    return res.json({
      success: true,
      message: 'Admin account recovery initiated. Password reset instructions sent to system administrator email.'
    });
  }

  try {
    const businesses = await db.getBusinesses();
    const matchedBiz = businesses.find(b => b.ownerUsername === username || b.name.toLowerCase().includes(username.toLowerCase()));

    if (matchedBiz) {
      return res.json({
        success: true,
        message: `Password reset request submitted for "${matchedBiz.name}". Please contact Administrator or check registered email.`
      });
    }
  } catch (err) {
    console.error('Forgot password check failed', err);
  }

  return res.json({
    success: true,
    message: 'If an account exists for this username, password recovery instructions have been sent.'
  });
};

export const getMe = async (req, res) => {
  // If we reach here, the auth middleware already validated req.user
  return res.json({ success: true, user: req.user });
};
