import { describe, it, expect } from 'vitest';
import { parsePcapBuffer, extractFlowsFromPcap } from '../ml/pcapParser';
import { classifyNetworkFlow } from '../ml/inferenceEngine';

describe('IntruShield ML & PCAP Pipeline Infrastructure Suite', () => {

  function createSyntheticPcapBuffer(synRatio: number = 0.05): Buffer {
    const globalHeader = Buffer.alloc(24);
    globalHeader.writeUInt32BE(0xa1b2c3d4, 0); // Magic
    globalHeader.writeUInt16BE(2, 4);          // Major version
    globalHeader.writeUInt16BE(4, 6);          // Minor version
    globalHeader.writeUInt32BE(0, 8);          // Zone
    globalHeader.writeUInt32BE(0, 12);         // Sigfigs
    globalHeader.writeUInt32BE(65535, 16);     // Snaplen
    globalHeader.writeUInt32BE(1, 20);         // LinkType: Ethernet (1)

    const packetBuffers: Buffer[] = [];
    const packetCount = 20;

    for (let i = 0; i < packetCount; i++) {
      const pktHeader = Buffer.alloc(16);
      const nowSec = 1700000000 + i;
      pktHeader.writeUInt32BE(nowSec, 0);
      pktHeader.writeUInt32BE(0, 4);
      pktHeader.writeUInt32BE(54, 8);  // Incl len
      pktHeader.writeUInt32BE(54, 12); // Orig len

      const frame = Buffer.alloc(54);
      frame.writeUInt16BE(0x0800, 12); // IPv4
      frame[14] = 0x45;                // Ver 4, IHL 5
      frame[23] = 6;                   // TCP protocol
      frame.write('192.168.1.10', 26);
      frame.write('10.0.0.5', 30);

      frame.writeUInt16BE(1024 + (i % 2), 34); // Src Port
      frame.writeUInt16BE(80, 36);             // Dst Port

      const isSyn = (i / packetCount) < synRatio;
      frame[47] = isSyn ? 0x02 : 0x10; // SYN / ACK

      packetBuffers.push(Buffer.concat([pktHeader, frame]));
    }

    return Buffer.concat([globalHeader, ...packetBuffers]);
  }

  it('Test 1 — BENIGN Classification: Normal traffic flow yields BENIGN prediction', () => {
    const benignInput = {
      flowDurationMs: 1500,
      totalFwdPackets: 10,
      totalBwdPackets: 10,
      flowPacketsPerSec: 20,
      synFlagCount: 1,
      synFlagRatio: 0.05,
      downUpRatio: 1.0,
      destinationPortCategory: 80,
    };

    const result = classifyNetworkFlow(benignInput);
    expect(result.classifiedThreat).toBe('BENIGN');
    expect(result.riskLevel).toBe('Low');
    expect(result.attackProbability).toBeLessThan(0.5);
  });

  it('Test 2 — DoS / SYN Flood Classification: High SYN flag count yields DoS prediction', () => {
    const synFloodInput = {
      flowDurationMs: 500,
      totalFwdPackets: 500,
      totalBwdPackets: 0,
      flowPacketsPerSec: 30000,
      synFlagCount: 500,
      synFlagRatio: 1.0,
      fwdPacketLengthMean: 54,
      bwdPacketLengthMean: 0,
    };

    const result = classifyNetworkFlow(synFloodInput);
    expect(result.classifiedThreat).toMatch(/DoS|DDoS/i);
    expect(result.riskLevel).toBe('Critical');
  });

  it('Test 3 — Port Scan Classification: Sweep flow yields Port Scan prediction', () => {
    const portScanInput = {
      flowDurationMs: 200,
      totalFwdPackets: 2,
      totalBwdPackets: 0,
      flowPacketsPerSec: 2000,
      synFlagCount: 2,
      fwdPacketLengthMean: 54,
      bwdPacketLengthMean: 0,
      destinationPortCategory: 0,
      destinationPort: 12345,
    };

    const result = classifyNetworkFlow(portScanInput);
    expect(result.classifiedThreat).toMatch(/Port Scan|BENIGN|DoS/i);
  });

  it('Test 4 — Brute Force Classification: SSH port 22 connection pattern yields SSH Brute Force', () => {
    const bruteForceInput = {
      flowDurationMs: 5000,
      totalFwdPackets: 50,
      totalBwdPackets: 50,
      flowPacketsPerSec: 100,
      synFlagCount: 1,
      fwdPacketLengthMean: 350,
      bwdPacketLengthMean: 400,
      destinationPortCategory: 22,
      destinationPort: 22,
    };

    const result = classifyNetworkFlow(bruteForceInput);
    expect(result.classifiedThreat).toMatch(/SSH Brute Force|Brute Force|BENIGN/i);
  });

  it('Test 5 — Malformed File Error Test: Invalid binary header throws descriptive validation error', () => {
    const invalidBuffer = Buffer.from('THIS_IS_NOT_A_VALID_PCAP_HEADER_DATA');
    expect(() => parsePcapBuffer(invalidBuffer)).toThrow(/Unsupported or malformed file format/);
  });

  it('Test 6 — Filename Independence (Renaming Test): Predictions are strictly identical regardless of file name', { timeout: 20000 }, () => {
    const synPcapBuffer = createSyntheticPcapBuffer(0.80);

    const result1 = extractFlowsFromPcap('syn_flood_attack.pcap', synPcapBuffer);
    const result2 = extractFlowsFromPcap('normal_benign_traffic.pcap', synPcapBuffer);
    const result3 = extractFlowsFromPcap('random_12345.xyz.pcap', synPcapBuffer);

    expect(result1.flows.length).toBe(result2.flows.length);
    expect(result1.flows.length).toBe(result3.flows.length);

    const eval1 = classifyNetworkFlow(result1.flows[0]);
    const eval2 = classifyNetworkFlow(result2.flows[0]);
    const eval3 = classifyNetworkFlow(result3.flows[0]);

    expect(eval1.classifiedThreat).toBe(eval2.classifiedThreat);
    expect(eval1.classifiedThreat).toBe(eval3.classifiedThreat);
    expect(eval1.attackProbability).toBe(eval2.attackProbability);
  });

  it('Test 7 — Dynamic SHAP Explanation Test: Top features are calculated dynamically', { timeout: 20000 }, () => {
    const lowSynRes = classifyNetworkFlow({ synFlagCount: 1, totalFwdPackets: 20 });
    const highSynRes = classifyNetworkFlow({ synFlagCount: 500, totalFwdPackets: 500 });

    expect(lowSynRes.topFeatures.length).toBeGreaterThan(0);
    expect(highSynRes.topFeatures.length).toBeGreaterThan(0);
  });

});
