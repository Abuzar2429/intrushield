import { beforeAll } from 'vitest';
import { initDatabase } from '../db/database';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-123456789';
  await initDatabase();
});
