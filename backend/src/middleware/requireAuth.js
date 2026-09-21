import { User } from '../models/User.js';
import { verifyToken } from '../lib/tokens.js';

export async function requireAuth(req, res, next) {
  const [scheme, token] = (req.get('authorization') ?? '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  let payload;

  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ error: 'Session expired. Sign in again.' });
  }

  const user = await User.findById(payload.sub);

  if (!user) {
    return res.status(401).json({ error: 'Session expired. Sign in again.' });
  }

  req.user = user;

  next();
}
