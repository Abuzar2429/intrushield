import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server';
import { generateToken } from '../middleware/authMiddleware';
import { getDb } from '../db/database';

describe('IntruShield Production Security & Data Isolation Architecture', () => {
  let adminToken: string;
  let adminUserId: string;

  let clientAToken: string;
  let clientAUserId: string;

  let clientBToken: string;
  let clientBUserId: string;

  beforeAll(async () => {
    // 1. Create Admin User
    const adminEmail = `admin-sec-${Date.now()}@intrushield.service`;
    const adminRes = await request(app).post('/api/auth/register').send({
      email: adminEmail,
      password: 'AdminPassword123!',
      name: 'SOC Administrator',
    });
    adminUserId = adminRes.body.user.id;

    // Promote to Administrator in DB
    const db = getDb();
    db.run("UPDATE users SET role = 'Administrator' WHERE id = ?", [adminUserId]);

    adminToken = generateToken({
      id: adminUserId,
      email: adminEmail,
      role: 'Administrator',
    });

    // 2. Register Client A
    const clientAEmail = `clientA-${Date.now()}@intrushield.service`;
    const clientARes = await request(app).post('/api/auth/register').send({
      email: clientAEmail,
      password: 'ClientAPassword123!',
      name: 'Client A Account',
    });
    clientAToken = clientARes.body.token;
    clientAUserId = clientARes.body.user.id;

    // 3. Register Client B
    const clientBEmail = `clientB-${Date.now()}@intrushield.service`;
    const clientBRes = await request(app).post('/api/auth/register').send({
      email: clientBEmail,
      password: 'ClientBPassword123!',
      name: 'Client B Account',
    });
    clientBToken = clientBRes.body.token;
    clientBUserId = clientBRes.body.user.id;
  });

  it('Requirement 1: Public registration automatically assigns role = Client', async () => {
    const email = `public-reg-${Date.now()}@example.com`;
    const res = await request(app).post('/api/auth/register').send({
      email,
      password: 'TestPassword123!',
      name: 'Public Registrant',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('Client');
  });

  it('Requirement 1: Public registration ignores role manipulation in body', async () => {
    const email = `priv-esc-${Date.now()}@example.com`;
    const res = await request(app).post('/api/auth/register').send({
      email,
      password: 'TestPassword123!',
      name: 'Malicious Attacker',
      role: 'Administrator',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('Client');
  });

  it('Requirement 2: Client receives 403 Forbidden on administrative endpoints', async () => {
    // GET /api/users
    const usersRes = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${clientAToken}`);
    expect(usersRes.status).toBe(403);

    // PATCH /api/users/:id/role
    const roleRes = await request(app)
      .patch(`/api/users/${clientBUserId}/role`)
      .set('Authorization', `Bearer ${clientAToken}`)
      .send({ role: 'Administrator' });
    expect(roleRes.status).toBe(403);

    // POST /api/mitigation/block-ip
    const blockRes = await request(app)
      .post('/api/mitigation/block-ip')
      .set('Authorization', `Bearer ${clientAToken}`)
      .send({ ip: '198.51.100.1' });
    expect(blockRes.status).toBe(403);

    // DELETE /api/threat-intel/TH-101
    const delIocRes = await request(app)
      .delete('/api/threat-intel/TH-101')
      .set('Authorization', `Bearer ${clientAToken}`);
    expect(delIocRes.status).toBe(403);

    // GET /api/models/metadata
    const modelRes = await request(app)
      .get('/api/models/metadata')
      .set('Authorization', `Bearer ${clientAToken}`);
    expect(modelRes.status).toBe(403);
  });

  it('Requirement 4: Data Isolation - Client A cannot see Client B PCAP scans', async () => {
    // Client A uploads a PCAP scan (via mock or endpoint)
    const db = getDb();
    const scanIdA = `SCAN-TEST-A-${Date.now()}`;
    db.run(
      `INSERT INTO pcap_scans (id, user_id, file_name, file_size_bytes, total_packets, flow_count, analysis_duration_seconds, attack_probability, classified_threat, risk_level, predicted_confidence, extracted_features_json, top_features_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [scanIdA, clientAUserId, 'clientA_capture.pcap', 1024, 50, 5, 0.1, 0.95, 'SYN Flood', 'Critical', 0.95, '{}', '[]', new Date().toISOString()]
    );

    // Client B queries PCAP scans
    const clientBScansRes = await request(app)
      .get('/api/pcap/scans')
      .set('Authorization', `Bearer ${clientBToken}`);

    expect(clientBScansRes.status).toBe(200);
    const clientBScans = clientBScansRes.body.scans;
    const hasScanA = clientBScans.some((s: any) => s.id === scanIdA);
    expect(hasScanA).toBe(false);

    // Client A queries PCAP scans
    const clientAScansRes = await request(app)
      .get('/api/pcap/scans')
      .set('Authorization', `Bearer ${clientAToken}`);

    expect(clientAScansRes.status).toBe(200);
    const clientAScans = clientAScansRes.body.scans;
    const foundScanA = clientAScans.some((s: any) => s.id === scanIdA);
    expect(foundScanA).toBe(true);
  });

  it('Requirement 4: Data Isolation - Client A cannot access Client B incidents', async () => {
    // Client A creates an incident
    const incRes = await request(app)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${clientAToken}`)
      .send({
        title: 'Client A Isolated Incident',
        severity: 'High',
        sourceIp: '192.0.2.1',
        targetIp: '10.0.0.5',
      });

    expect(incRes.status).toBe(201);
    const incidentIdA = incRes.body.incident.id;

    // Client B attempts to fetch Client A incident directly
    const fetchRes = await request(app)
      .get(`/api/incidents/${incidentIdA}`)
      .set('Authorization', `Bearer ${clientBToken}`);

    expect(fetchRes.status).toBe(403);

    // Client B attempts to modify Client A incident status
    const updateRes = await request(app)
      .patch(`/api/incidents/${incidentIdA}/status`)
      .set('Authorization', `Bearer ${clientBToken}`)
      .send({ status: 'Resolved' });

    expect(updateRes.status).toBe(403);

    // Client A fetches their own incident
    const ownFetchRes = await request(app)
      .get(`/api/incidents/${incidentIdA}`)
      .set('Authorization', `Bearer ${clientAToken}`);

    expect(ownFetchRes.status).toBe(200);
    expect(ownFetchRes.body.incident.id).toBe(incidentIdA);
  });

  it('Requirement 3 & 13: Administrator can access user metrics and audit logs', async () => {
    // Admin queries user list with metrics
    const usersRes = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(usersRes.status).toBe(200);
    expect(usersRes.body).toHaveProperty('users');
    const firstUser = usersRes.body.users[0];
    expect(firstUser).toHaveProperty('scanCount');
    expect(firstUser).toHaveProperty('lastActivity');

    // Admin queries audit logs
    const auditRes = await request(app)
      .get('/api/users/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(auditRes.status).toBe(200);
    expect(auditRes.body).toHaveProperty('logs');
    expect(Array.isArray(auditRes.body.logs)).toBe(true);
    expect(auditRes.body.logs.length).toBeGreaterThan(0);
  });

  it('Requirement 12: Audit log records unauthorized access attempts', async () => {
    const unauthRes = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${clientAToken}`);

    expect(unauthRes.status).toBe(403);

    const db = getDb();
    const rows = db.exec("SELECT * FROM audit_logs WHERE action = 'UNAUTHORIZED_ACCESS_ATTEMPT'");
    expect(rows.length).toBeGreaterThan(0);
  });
});
