import { isDatabaseReady } from '../db.js';

export function requireDatabase(req, res, next) {
  if (!isDatabaseReady()) {
    return res.status(503).json({ error: 'Database unavailable. Try again in a moment.' });
  }

  next();
}
