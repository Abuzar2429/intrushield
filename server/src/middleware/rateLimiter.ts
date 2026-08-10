import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitRecord>();

/**
 * Creates an in-memory rate limiter middleware based on client IP.
 * @param windowMs Time window in milliseconds
 * @param maxMax Maximum requests allowed within windowMs
 * @param message Custom response message on rate limit exceed
 */
export function createRateLimiter(windowMs: number, maxMax: number, message: string = 'Too many requests. Please try again later.') {
  // Periodic cleanup of expired IP keys to prevent memory growth
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, Math.max(windowMs, 60000)).unref?.();

  return (req: Request, res: Response, next: NextFunction) => {
    // In test environment, bypass rate limits to avoid interfering with test suites
    if (process.env.NODE_ENV === 'test') {
      next();
      return;
    }

    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const key = `${req.baseUrl || req.path}:${ip}`;
    const now = Date.now();

    const record = store.get(key);

    if (!record || now > record.resetTime) {
      store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      res.setHeader('X-RateLimit-Limit', maxMax);
      res.setHeader('X-RateLimit-Remaining', maxMax - 1);
      next();
      return;
    }

    record.count += 1;

    const remaining = Math.max(0, maxMax - record.count);
    res.setHeader('X-RateLimit-Limit', maxMax);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > maxMax) {
      res.status(429).json({
        error: message,
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000)
      });
      return;
    }

    next();
  };
}

// Pre-configured rate limiters
export const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10,             // max 10 requests
  'Too many authentication attempts from this IP address. Please try again after 15 minutes.'
);

export const apiRateLimiter = createRateLimiter(
  60 * 1000,      // 1 minute
  100,            // max 100 requests
  'API request rate limit exceeded. Please slow down your requests.'
);
