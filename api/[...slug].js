import app from '../server/index.js';

export default function (req, res) {
  // Vercel Serverless Functions automatically strip the "/api" prefix from req.url.
  // We need to restore it so our Express app routes (/api/auth, /api/businesses, etc.) match correctly.
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url === '/' ? '' : req.url);
  }
  return app(req, res);
}
