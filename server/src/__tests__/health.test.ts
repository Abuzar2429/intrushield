import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server';

describe('GET /api/health', () => {
  it('should return 200 OK with online status and database statistics', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'online');
    expect(response.body).toHaveProperty('service', 'IntruShield NIDS Core Engine');
    expect(response.body).toHaveProperty('database');
    expect(response.body.database.status).toBe('connected');
    expect(typeof response.body.database.usersCount).toBe('number');
    expect(typeof response.body.database.incidentsCount).toBe('number');
  });
});
