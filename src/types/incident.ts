import type { RiskLevel, Packet, FeatureAttribution } from './packet';

export type IncidentStatus = 'Open' | 'Investigating' | 'Mitigated' | 'Resolved' | 'False Positive';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: RiskLevel;
  source: string;
}

export interface RemediationAction {
  id: string;
  actionTitle: string;
  category: 'Firewall Rule' | 'Host Isolation' | 'Credential Reset' | 'Traffic Throttling';
  target: string;
  executed: boolean;
  executedAt?: string;
  recommendedReason: string;
}

export interface Incident {
  id: string;
  incidentCode: string; // e.g. INC-2026-8901
  title: string;
  category: string; // DDoS, Ransomware C2, Port Scan, Data Exfiltration, SQL Injection
  riskLevel: RiskLevel;
  riskScore: number; // 0 to 100
  confidenceScore: number; // percentage e.g. 98.4
  detectedAt: string;
  updatedAt: string;
  status: IncidentStatus;
  primaryAttackerIp: string;
  targetedHostIp: string;
  affectedSystemsCount: number;
  timeline: TimelineEvent[];
  explanation: {
    naturalLanguageReasoning: string;
    shapWaterfall: FeatureAttribution[];
    confidenceDistribution: { label: string; value: number }[];
  };
  evidencePackets: Packet[];
  remediationActions: RemediationAction[];
}
