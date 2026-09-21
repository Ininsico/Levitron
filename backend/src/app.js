import express from 'express';
import cors from 'cors';

import { apiRouter } from './routes/index.js';

const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(
    cors({
      origin: allowedOrigins,
      // The browser needs to read this to name the downloaded file.
      exposedHeaders: ['Content-Disposition'],
    }),
  );
  app.use(express.json({ limit: '256kb' }));

  app.use('/api', apiRouter);

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found', path: req.originalUrl });
  });

  app.use((err, req, res, next) => {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
    res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
  });

  return app;
}
