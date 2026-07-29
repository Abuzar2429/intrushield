export type RiskLevel = 'Normal' | 'Low' | 'Medium' | 'High' | 'Critical';
export type ProtocolType = 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'HTTPS' | 'DNS' | 'SSH';

export interface Packet {
  id: string;
  timestamp: string;
  sourceIp: string;
  sourcePort: number;
  destinationIp: string;
  destinationPort: number;
  protocol: ProtocolType;
  packetSize: number; // in bytes
  riskLevel: RiskLevel;
  riskScore: number; // 0 to 100
  predictedAttackType: string;
  status: 'Inspected' | 'Flagged' | 'Dropped' | 'Passed';
  payloadSample?: string;
  flags?: string[];
  ttl?: number;
  flowDurationMs?: number;
}

export interface FeatureAttribution {
  featureName: string;
  description: string;
  value: number | string;
  impactScore: number; // positive = pushes towards malicious, negative = pushes towards normal
}

export interface PCAPAnalysisResult {
  fileName: string;
  fileSizeBytes: number;
  totalPackets: number;
  flowCount: number;
  analysisDurationSeconds: number;
  attackProbability: number; // 0.0 to 1.0
  classifiedThreat: string;
  riskLevel: RiskLevel;
  extractedFeatures: {
    name: string;
    value: string | number;
    unit?: string;
  }[];
  topContributingFeatures: FeatureAttribution[];
  predictedConfidence: number; // 0.0 to 1.0
}
