import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server';

describe('Threat Intel REST API Endpoints', () => {
  let authToken: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@intrushield.io', password: 'Admin@12345' });
    authToken = res.body.token;
  });

  it('should fetch list of threat intelligence indicators', async () => {
    const res = await request(app).get('/api/threat-intel');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.iocs)).toBe(true);
    expect(res.body.iocs.length).toBeGreaterThan(0);
  });

  it('should create a new threat intelligence record with valid auth token', async () => {
    const newIoc = {
      ioc: `203.0.113.${Math.floor(1 + Math.random() * 250)}`,
      type: 'IPv4',
      threatActor: 'APT-41',
      riskLevel: 'High',
      confidence: 0.88,
      description: 'Command & Control server node.',
    };

    const res = await request(app)
      .post('/api/threat-intel')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newIoc);

    expect(res.status).toBe(201);
    expect(res.body.ioc).toHaveProperty('ioc', newIoc.ioc);
  });
});
