import { Router } from 'express';

import { stats } from '../data/stats.js';
import { isDatabaseReady } from '../db.js';
import { authRouter } from './auth.js';
import { documentsRouter } from './documents.js';
import { waitlistRouter } from './waitlist.js';

export const apiRouter = Router();

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isDatabaseReady() ? 'connected' : 'disconnected',
    uptime: Number(process.uptime().toFixed(3)),
    timestamp: new Date().toISOString(),
  });
});

apiRouter.get('/stats', (req, res) => {
  res.json({ data: stats });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/documents', documentsRouter);
apiRouter.use('/waitlist', waitlistRouter);
