import { describe, it, expect, beforeEach } from 'vitest';
import express, { Request, Response } from 'express';
import request from 'supertest';
import { createRateLimiter } from '../middleware/rateLimiter';

describe('Rate Limiter Middleware', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
  });

  it('should allow requests within rate limit', async () => {
    // Temporarily set NODE_ENV to production to test rate limiting logic
    process.env.NODE_ENV = 'production';

    const app = express();
    const testLimiter = createRateLimiter(60000, 3, 'Rate limit test exceeded');
    app.use(testLimiter);
    app.get('/test', (_req: Request, res: Response) => {
      res.json({ ok: true });
    });

    const res1 = await request(app).get('/test');
    expect(res1.status).toBe(200);
    expect(res1.headers['x-ratelimit-remaining']).toBe('2');

    const res2 = await request(app).get('/test');
    expect(res2.status).toBe(200);
    expect(res2.headers['x-ratelimit-remaining']).toBe('1');

    process.env.NODE_ENV = originalEnv;
  });

  it('should return 429 when rate limit is exceeded', async () => {
    process.env.NODE_ENV = 'production';

    const app = express();
    // Unique route to avoid store key collision
    const testLimiter = createRateLimiter(60000, 2, 'Limit reached');
    app.get('/limited', testLimiter, (_req: Request, res: Response) => {
      res.json({ ok: true });
    });

    await request(app).get('/limited');
    await request(app).get('/limited');
    const blockedRes = await request(app).get('/limited');

    expect(blockedRes.status).toBe(429);
    expect(blockedRes.body).toHaveProperty('error', 'Limit reached');

    process.env.NODE_ENV = originalEnv;
  });
});
