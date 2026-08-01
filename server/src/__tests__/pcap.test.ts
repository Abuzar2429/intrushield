import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server';

describe('PCAP Analysis REST API Endpoints', () => {
  it('should process PCAP file upload and return classification results', async () => {
    const dummyBuffer = Buffer.from('DUMMY_PCAP_PACKET_DATA_HEADER');

    const res = await request(app)
      .post('/api/pcap/upload')
      .attach('file', dummyBuffer, 'sample_traffic.pcap');

    expect(res.status).toBe(201);
    expect(res.body.scan).toHaveProperty('fileName', 'sample_traffic.pcap');
    expect(res.body.scan).toHaveProperty('classifiedThreat');
    expect(res.body.scan).toHaveProperty('attackProbability');
  });

  it('should fetch history of PCAP scans', async () => {
    const res = await request(app).get('/api/pcap/scans');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.scans)).toBe(true);
    expect(res.body.scans.length).toBeGreaterThan(0);
  });
});
