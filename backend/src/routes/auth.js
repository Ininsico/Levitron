import { Router } from 'express';

import { hashPassword, verifyPassword } from '../lib/password.js';
import { signToken } from '../lib/tokens.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import { User } from '../models/User.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;

export const authRouter = Router();

authRouter.use(requireDatabase);

authRouter.post('/register', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (name.length < 2 || name.length > 80) {
    return res.status(400).json({ error: 'Your name must be between 2 and 80 characters.' });
  }

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res
      .status(400)
      .json({ error: `Your password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
  }

  const existing = await User.findOne({ email });

  if (existing) {
    return res.status(409).json({ error: 'That email is already registered. Sign in instead.' });
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash, lastLoginAt: new Date() });

  res.status(201).json({ data: { token: signToken(user), user: user.toPublicJSON() } });
});

authRouter.post('/login', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!EMAIL_PATTERN.test(email) || !password) {
    return res.status(400).json({ error: 'Email and password are both required.' });
  }

  const user = await User.findOne({ email }).select('+passwordHash');

  // Same response for unknown email and wrong password, so the endpoint
  // cannot be used to work out which addresses have accounts.
  const isValid = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!isValid) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json({ data: { token: signToken(user), user: user.toPublicJSON() } });
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ data: { user: req.user.toPublicJSON() } });
});
