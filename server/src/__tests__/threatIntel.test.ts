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

  it('should reject fetching threat intel indicators without auth token', async () => {
    const res = await request(app).get('/api/threat-intel');
    expect(res.status).toBe(401);
  });

  it('should fetch list of threat intelligence indicators with auth token', async () => {
    const res = await request(app)
      .get('/api/threat-intel')
      .set('Authorization', `Bearer ${authToken}`);

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

  it('should reject Client role from deleting threat intel IOC (403 Forbidden)', async () => {
    const clientRes = await request(app).post('/api/auth/register').send({
      email: `client-threat-${Date.now()}@intrushield.io`,
      password: 'Password123!',
      name: 'Client Threat Intel Test',
    });
    const clientToken = clientRes.body.token;

    const res = await request(app)
      .delete('/api/threat-intel/TH-101')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('should allow Administrator to delete threat intel IOC', async () => {
    const createRes = await request(app)
      .post('/api/threat-intel')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        ioc: `198.51.100.${Math.floor(1 + Math.random() * 250)}`,
        type: 'IPv4',
        riskLevel: 'High',
      });
    const targetId = createRes.body.ioc.id;

    const res = await request(app)
      .delete(`/api/threat-intel/${targetId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', targetId);
  });
});
