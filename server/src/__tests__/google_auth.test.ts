import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

const { mockVerifyIdToken } = vi.hoisted(() => ({
  mockVerifyIdToken: vi.fn(),
}));

vi.mock('google-auth-library', () => {
  return {
    OAuth2Client: class MockOAuth2Client {
      verifyIdToken(opts: any) {
        return mockVerifyIdToken(opts);
      }
    },
  };
});

import request from 'supertest';
import { app } from '../server';

describe('Google OAuth 2.0 / OIDC Authentication API', () => {
  const MOCK_CLIENT_ID = '309087614333-v0dg6dqg7p4i5o2mollpedj84223bppv.apps.googleusercontent.com';
  const MOCK_ADMIN_EMAIL = 'admin-sovereign@intrushield.service';

  beforeAll(() => {
    process.env.GOOGLE_CLIENT_ID = MOCK_CLIENT_ID;
    process.env.ADMIN_EMAIL = MOCK_ADMIN_EMAIL;
  });

  beforeEach(() => {
    process.env.GOOGLE_CLIENT_ID = MOCK_CLIENT_ID;
    process.env.ADMIN_EMAIL = MOCK_ADMIN_EMAIL;
    mockVerifyIdToken.mockReset();
  });

  it('Requirement 1 & 5: Should reject Google auth request if GOOGLE_CLIENT_ID missing', async () => {
    delete process.env.GOOGLE_CLIENT_ID;

    const res = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'some-token' });

    expect(res.status).toBe(500);
    expect(res.body.error).toContain('not configured');
  });

  it('Requirement 8: Should reject invalid or expired Google ID token with 401 Unauthorized', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Invalid token signature'));

    const res = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'invalid-signature-token' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('Requirement 2 & 8: Normal Google user automatically receives role = Client', async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        email: 'public-client@example.com',
        email_verified: true,
        sub: 'google-sub-10001',
        name: 'Public Client User',
        picture: 'https://example.com/avatar.jpg',
      }),
    });

    const res = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'valid-client-google-token' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('role', 'Client');
    expect(res.body.user.email).toBe('public-client@example.com');
  });

  it('Requirement 2 & 3 & 8: Google account matching ADMIN_EMAIL receives role = Administrator', async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        email: MOCK_ADMIN_EMAIL,
        email_verified: true,
        sub: 'google-sub-99999',
        name: 'Admin Owner',
        picture: 'https://example.com/admin.jpg',
      }),
    });

    const res = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'valid-admin-google-token' });

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('role', 'Administrator');
    expect(res.body.user.email).toBe(MOCK_ADMIN_EMAIL);
  });

  it('Requirement 8: Client user registered via Google cannot access administrator endpoints', async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        email: 'restricted-user@example.com',
        email_verified: true,
        sub: 'google-sub-55555',
        name: 'Restricted User',
      }),
    });

    const authRes = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'valid-restricted-token' });

    const clientToken = authRes.body.token;
    expect(clientToken).toBeDefined();

    // Try to access /api/users
    const usersRes = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(usersRes.status).toBe(403);

    // Try to access /api/mitigation/block-ip
    const blockRes = await request(app)
      .post('/api/mitigation/block-ip')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ ip: '198.51.100.99' });
    expect(blockRes.status).toBe(403);
  });
});
