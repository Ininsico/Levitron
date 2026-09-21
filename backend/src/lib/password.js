import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const SCHEME = 'scrypt';

export async function hashPassword(password) {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await scryptAsync(password, salt, KEY_LENGTH);

  return `${SCHEME}$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, saltHex, hashHex] = String(stored ?? '').split('$');

  if (scheme !== SCHEME || !saltHex || !hashHex) {
    return false;
  }

  const derived = await scryptAsync(password, Buffer.from(saltHex, 'hex'), KEY_LENGTH);
  const expected = Buffer.from(hashHex, 'hex');

  if (derived.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(derived, expected);
}
