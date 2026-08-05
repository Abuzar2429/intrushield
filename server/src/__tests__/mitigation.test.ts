import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server';
import { classifyNetworkFlow } from '../ml/inferenceEngine';

describe('ML Inference Engine & Mitigation REST API', () => {
  let authToken: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@intrushield.io', password: 'Admin@12345' });
    authToken = res.body.token;
  });

  describe('ML Inference Engine', () => {
    it('should classify SYN flood volumetric anomalies with high confidence', () => {
      const result = classifyNetworkFlow(
        {
          flowDurationMs: 4500,
          totalFwdPackets: 400000,
          totalBwdPackets: 40000,
          flowBytesPerSec: 180000000,
          flowPacketsPerSec: 320000,
          synFlagCount: 390000,
          ackFlagCount: 40000,
        },
        'SYN_flood_sample.pcap'
      );

      expect(result.classifiedThreat).toContain('SYN Flood');
      expect(result.riskLevel).toBe('Critical');
      expect(result.attackProbability).toBeGreaterThan(0.9);
      expect(result.topFeatures.length).toBeGreaterThan(0);
    });

    it('should classify benign traffic baselines correctly', () => {
      const result = classifyNetworkFlow(
        {
          flowDurationMs: 1200,
          totalFwdPackets: 500,
          totalBwdPackets: 500,
          flowBytesPerSec: 120000,
          flowPacketsPerSec: 800,
          synFlagCount: 5,
          ackFlagCount: 495,
        },
        'normal_corporate_trace.pcap'
      );

      expect(result.classifiedThreat).toContain('Benign');
      expect(result.riskLevel).toBe('Low');
      expect(result.attackProbability).toBeLessThan(0.5);
    });
  });

  describe('Mitigation REST API Endpoints', () => {
    it('should fetch list of active mitigation rules with valid auth token', async () => {
      const res = await request(app)
        .get('/api/mitigation/active-rules')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.rules)).toBe(true);
    });

    it('should enforce automated IP mitigation block rule with valid auth token', async () => {
      const targetIp = `185.220.101.${Math.floor(10 + Math.random() * 200)}`;

      const res = await request(app)
        .post('/api/mitigation/block-ip')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ip: targetIp,
          reason: 'Automated BGP Flowspec quarantine trigger',
          actionType: 'BGP_FLOWSPEC',
        });

      expect(res.status).toBe(201);
      expect(res.body.rule).toHaveProperty('ipAddress', targetIp);
      expect(res.body.rule.ruleSyntax).toContain('flow route');
    });

    it('should reject invalid IP payloads to prevent command injection', async () => {
      const res = await request(app)
        .post('/api/mitigation/block-ip')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ip: '10.0.0.1; reboot',
          reason: 'Malicious payload injection test',
        });

      expect(res.status).toBe(400);
    });

    it('should reject IP mitigation request without authentication', async () => {
      const res = await request(app)
        .post('/api/mitigation/block-ip')
        .send({ ip: '10.0.0.1' });

      expect(res.status).toBe(401);
    });
  });
});
