import crypto from 'node:crypto';

/**
 * Hash a password using Node.js standard library (crypto.scryptSync).
 * No external dependencies required.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify a password against a stored scrypt hash in constant time.
 */
export function verifyPassword(password: string, hash: string): boolean {
  const [salt, key] = hash.split(':');
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

/**
 * Generate cryptographically secure UUID v4 string.
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
