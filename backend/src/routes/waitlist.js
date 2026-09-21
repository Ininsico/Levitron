import { Router } from 'express';

import { requireDatabase } from '../middleware/requireDatabase.js';
import { WaitlistSubscriber } from '../models/WaitlistSubscriber.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const waitlistRouter = Router();

waitlistRouter.use(requireDatabase);

waitlistRouter.get('/', async (req, res) => {
  const total = await WaitlistSubscriber.countDocuments();

  res.json({ data: { count: total } });
});

waitlistRouter.post('/', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  try {
    await WaitlistSubscriber.create({ email });
  } catch (error) {
    if (error.code !== 11000) throw error;

    const total = await WaitlistSubscriber.countDocuments();

    return res.status(200).json({ data: { email, created: false, total } });
  }

  const total = await WaitlistSubscriber.countDocuments();

  res.status(201).json({ data: { email, created: true, total } });
});
