import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server';

describe('PCAP Analysis REST API Endpoints', () => {
  let authToken: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@intrushield.io', password: 'Admin@12345' });
    authToken = res.body.token;
  });

  it('should process PCAP file upload and return classification results with auth token', async () => {
    const dummyBuffer = Buffer.alloc(24);
    dummyBuffer.writeUInt32BE(0xa1b2c3d4, 0); // Magic
    dummyBuffer.writeUInt16BE(2, 4);          // Major version
    dummyBuffer.writeUInt16BE(4, 6);          // Minor version
    dummyBuffer.writeUInt32BE(1, 20);         // LinkType: Ethernet

    const res = await request(app)
      .post('/api/pcap/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', dummyBuffer, 'sample_traffic.pcap');

    expect(res.status).toBe(201);
    expect(res.body.scan).toHaveProperty('fileName', 'sample_traffic.pcap');
    expect(res.body.scan).toHaveProperty('classifiedThreat');
    expect(res.body.scan).toHaveProperty('attackProbability');
  });

  it('should fetch history of PCAP scans with auth token', async () => {
    const res = await request(app)
      .get('/api/pcap/scans')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.scans)).toBe(true);
    expect(res.body.scans.length).toBeGreaterThan(0);
  });
});
