import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Hash a password using industry-standard bcrypt library.
 */
export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

/**
 * Verify a password against a stored hash using bcrypt.
 * Fallback to legacy scrypt for existing pre-migration records.
 */
export function verifyPassword(password: string, hash: string): boolean {
  if (!hash) return false;

  // Legacy scrypt hash format fallback (salt:derivedKey)
  if (hash.includes(':')) {
    const [salt, key] = hash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  }

  return bcrypt.compareSync(password, hash);
}

/**
 * Generate cryptographically secure UUID v4 string.
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
