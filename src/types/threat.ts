import type { RiskLevel } from './packet';

export interface MitreTechnique {
  id: string; // e.g. T1046
  tactic: 'Reconnaissance' | 'Initial Access' | 'Execution' | 'Persistence' | 'Privilege Escalation' | 'Credential Access' | 'Command and Control' | 'Exfiltration' | 'Impact';
  name: string;
  description: string;
  detectedCount: number;
  riskLevel: RiskLevel;
  mitigation: string;
}

export interface ThreatActorFeed {
  id: string;
  name: string;
  alias: string;
  originCountry: string;
  targetIndustries: string[];
  firstSeen: string;
  lastActive: string;
  threatLevel: RiskLevel;
  description: string;
  associatedCVEs: string[];
  associatedIOCs: string[];
}

export interface CVEItem {
  id: string; // e.g. CVE-2026-1184
  cvssScore: number; // e.g. 9.8
  severity: RiskLevel;
  affectedProtocol: string;
  summary: string;
  publishedDate: string;
  mitigationSteps: string;
  references: string[];
}
