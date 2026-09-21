import jwt from 'jsonwebtoken';

const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function assertTokenSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      'JWT_SECRET is not set. Add a long random value to backend/.env — see backend/.env.example.',
    );
  }
}

function secret() {
  assertTokenSecret();

  return process.env.JWT_SECRET;
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, secret(), { expiresIn: EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, secret());
}
