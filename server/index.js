import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

import { PORT, NODE_ENV } from './config/env.js';
import authRoutes from './routes/auth.js';
import businessRoutes from './routes/business.js';
import feedbackRoutes from './routes/feedback.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { connectDB } from './db/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize MongoDB Atlas connection
connectDB();

// Dynamic CORS configuration (supports local dev and cloud deployments like Render)
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or same-origin static files)
    if (!origin) return callback(null, true);
    callback(null, true); // Allow all valid web origins
  },
  credentials: true // Crucial for session cookies!
}));

app.use(express.json());
app.use(cookieParser());

// Apply rate limiting (except for assets, restrict API endpoints)
app.use('/api', generalLimiter);

// Health Check API Endpoint
app.get('/api/health', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  return res.json({
    status: 'OK',
    service: 'ReviewFlow AI API Engine',
    mongodb: isMongoConnected ? 'connected' : 'connecting',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/feedbacks', feedbackRoutes);

// Static client hosting in Production
const funnelBuildPath = path.resolve(__dirname, '../client-funnel/dist');
const adminBuildPath = path.resolve(__dirname, '../client-admin/dist');
const ownerBuildPath = path.resolve(__dirname, '../client-owner/dist');

// Trailing slash redirects for sub-apps to guarantee relative asset loading
app.get('/admin', (req, res) => res.redirect(301, '/admin/'));
app.get('/owner', (req, res) => res.redirect(301, '/owner/'));

// Serve Admin Dashboard at '/admin/'
app.use('/admin', express.static(adminBuildPath));

// Serve Shop Owner Dashboard at '/owner/'
app.use('/owner', express.static(ownerBuildPath));

// Serve Customer Funnel at '/'
app.use(express.static(funnelBuildPath));

// SPA Fallback for Admin Dashboard routing
app.get([/^\/admin\/.*/], (req, res) => {
  res.sendFile(path.join(adminBuildPath, 'index.html'));
});

// SPA Fallback for Shop Owner Dashboard routing
app.get([/^\/owner\/.*/], (req, res) => {
  res.sendFile(path.join(ownerBuildPath, 'index.html'));
});

// SPA Fallback for Customer Funnel routing
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(funnelBuildPath, 'index.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  ReviewFlow AI Fullstack Server listening on Port ${PORT}`);
  console.log(`  Environment: ${NODE_ENV}`);
  console.log(`  Database Status: MongoDB Atlas Active`);
  console.log(`====================================================`);
});
