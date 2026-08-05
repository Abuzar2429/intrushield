import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server';

describe('Incidents REST API Endpoints', () => {
  let authToken: string;
  let createdIncidentId: string;

  beforeAll(async () => {
    // Obtain auth token from default admin user
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@intrushield.io', password: 'Admin@12345' });
    authToken = res.body.token;
  });

  it('should reject fetching list of incidents without auth token', async () => {
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(401);
  });

  it('should fetch list of security incidents with valid auth token', async () => {
    const res = await request(app)
      .get('/api/incidents')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.incidents)).toBe(true);
    expect(res.body.incidents.length).toBeGreaterThan(0);
  });

  it('should create a new incident with valid auth token', async () => {
    const newIncident = {
      title: 'Automated Port Scan Anomaly',
      severity: 'Medium',
      status: 'Active',
      sourceIp: '192.168.1.105',
      targetIp: '10.0.4.1',
      threatScore: 65,
      description: 'Sequential TCP SYN port sweep across ports 20-1024.',
      mitigationStatus: 'Investigating',
    };

    const res = await request(app)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newIncident);

    expect(res.status).toBe(201);
    expect(res.body.incident).toHaveProperty('id');
    expect(res.body.incident.title).toBe(newIncident.title);

    createdIncidentId = res.body.incident.id;
  });

  it('should fetch incident by ID with auth token', async () => {
    const res = await request(app)
      .get(`/api/incidents/${createdIncidentId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.incident.id).toBe(createdIncidentId);
  });

  it('should update incident mitigation status with valid auth token', async () => {
    const res = await request(app)
      .patch(`/api/incidents/${createdIncidentId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'Resolved', mitigationStatus: 'Mitigated - IP Blocked' });

    expect(res.status).toBe(200);
    expect(res.body.incident.status).toBe('Resolved');
  });

  it('should return 404 for non-existent incident ID with auth token', async () => {
    const res = await request(app)
      .get('/api/incidents/NON_EXISTENT_999')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
  });
});
