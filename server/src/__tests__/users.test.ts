import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server';
import { generateToken } from '../middleware/authMiddleware';

describe('Users Admin REST API Endpoints', () => {
  let adminToken: string;
  let analystToken: string;
  let analystId: string;

  beforeAll(async () => {
    // Register Admin
    const adminEmail = `admin-${Date.now()}@intrushield.io`;
    const adminRes = await request(app).post('/api/auth/register').send({
      email: adminEmail,
      password: 'AdminPassword123!',
      name: 'SOC Lead Admin',
    });

    const adminId = adminRes.body.user.id;

    // Promote admin user role in DB and generate new token with Administrator role
    const db = (await import('../db/database')).getDb();
    db.run("UPDATE users SET role = 'Administrator' WHERE email = ?", [adminEmail]);

    adminToken = generateToken({
      id: adminId,
      email: adminEmail,
      role: 'Administrator',
    });

    // Register Analyst
    const analystEmail = `analyst-${Date.now()}@intrushield.io`;
    const analystRes = await request(app).post('/api/auth/register').send({
      email: analystEmail,
      password: 'AnalystPassword123!',
      name: 'SOC Analyst One',
    });
    analystToken = analystRes.body.token;
    analystId = analystRes.body.user.id;
  });

  it('should allow Administrator to fetch user list', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it('should reject Analyst from fetching user list', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${analystToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('should allow Administrator to update user role', async () => {
    const res = await request(app)
      .patch(`/api/users/${analystId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'Auditor' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('newRole', 'Auditor');
  });
});
