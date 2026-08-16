import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server';

describe('Auth REST API Endpoints', () => {
  const testUser = {
    name: 'Security Test Client',
    email: `test-client-${Date.now()}@intrushield.io`,
    password: 'SecurePassword123!',
  };

  let token: string;

  it('should register a new security user with Client role automatically', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', testUser.email);
    expect(res.body.user).toHaveProperty('role', 'Client');
  });

  it('should ignore role parameter in registration payload and still enforce Client role', async () => {
    const maliciousUser = {
      name: 'Hacker Wants Admin',
      email: `hacker-${Date.now()}@intrushield.io`,
      password: 'HackerPassword123!',
      role: 'Administrator',
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(maliciousUser);

    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty('role', 'Client');
  });

  it('should reject registration with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('should authenticate user and return JWT token on login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', testUser.email);

    token = res.body.token;
  });

  it('should reject login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should return profile data for authenticated user', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('email', testUser.email);
    expect(res.body.user).toHaveProperty('role', 'Client');
  });

  it('should reject profile request without valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/profile');

    expect(res.status).toBe(401);
  });

  it('should reject profile request with malformed Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer INVALID_JWT_SECRET_PAYLOAD');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should reject unauthenticated password reset attempt', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({
        email: testUser.email,
        newPassword: 'HackedPassword123!',
      });

    expect(res.status).toBe(401);
  });
});
