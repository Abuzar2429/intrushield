import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { classifyNetworkFlow } from '../ml/inferenceEngine';

describe('Trained ML Model Weights & Decision Tree Ensemble Inference', () => {
  it('should verify that model_weights.json artifact exists and contains trained ensemble trees', () => {
    const weightsPath = path.join(__dirname, '..', 'ml', 'model_weights.json');
    expect(fs.existsSync(weightsPath)).toBe(true);

    const weightsContent = JSON.parse(fs.readFileSync(weightsPath, 'utf8'));
    expect(weightsContent).toHaveProperty('metadata');
    expect(weightsContent.metadata.model_name).toContain('Random Forest');
    expect(Array.isArray(weightsContent.trees)).toBe(true);
    expect(weightsContent.trees.length).toBeGreaterThan(0);
    expect(weightsContent).toHaveProperty('feature_importances');
  });

  it('should run dynamic tree traversal inference for high-volume SYN flood traffic', () => {
    const result = classifyNetworkFlow(
      {
        flowDurationMs: 3000,
        totalFwdPackets: 350000,
        totalBwdPackets: 5000,
        flowBytesPerSec: 150000000,
        flowPacketsPerSec: 280000,
        synFlagCount: 340000,
        ackFlagCount: 10000,
        payloadEntropy: 5.1,
      },
      'SYN_flood_attack.pcap'
    );

    expect(result.classifiedThreat).toBe('Volumetric SYN Flood DDoS');
    expect(result.riskLevel).toBe('Critical');
    expect(result.attackProbability).toBeGreaterThan(0.9);
    expect(result.topFeatures.length).toBe(4);
    expect(result.topFeatures[0]).toHaveProperty('featureName');
  });

  it('should classify normal baseline traffic correctly with low attack probability', () => {
    const result = classifyNetworkFlow(
      {
        flowDurationMs: 8000,
        totalFwdPackets: 200,
        totalBwdPackets: 250,
        flowBytesPerSec: 25000,
        flowPacketsPerSec: 50,
        synFlagCount: 2,
        ackFlagCount: 240,
        payloadEntropy: 5.0,
      },
      'normal_web_browse.pcap'
    );

    expect(result.classifiedThreat).toBe('Benign Traffic Baseline');
    expect(result.riskLevel).toBe('Low');
    expect(result.attackProbability).toBeLessThan(0.1);
  });
});
