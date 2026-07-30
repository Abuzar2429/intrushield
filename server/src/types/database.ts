export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  created_at: string;
}

export interface IncidentRecord {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Investigating' | 'Resolved' | 'Closed';
  source_ip: string;
  target_ip: string;
  threat_score: number;
  description: string;
  timestamp: string;
  mitigation_status: string;
}

export interface ThreatIntelRecord {
  id: string;
  ioc: string;
  type: 'IPv4' | 'IPv6' | 'Domain' | 'Hash';
  threat_actor: string;
  risk_level: string;
  confidence: number;
  status: string;
  last_seen: string;
  description: string;
}

export interface PcapScanRecord {
  id: string;
  file_name: string;
  file_size_bytes: number;
  total_packets: number;
  flow_count: number;
  analysis_duration_seconds: number;
  attack_probability: number;
  classified_threat: string;
  risk_level: string;
  predicted_confidence: number;
  extracted_features_json: string;
  top_features_json: string;
  created_at: string;
}
