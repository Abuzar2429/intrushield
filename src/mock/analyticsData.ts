import type { TrafficDataPoint, AttackCategoryDistribution, SystemHealthMetric } from '../types/analytics';

export const MOCK_TRAFFIC_TIMELINE: TrafficDataPoint[] = [
  { time: '00:00', totalVolumeMb: 420, normalTrafficMb: 410, suspiciousTrafficMb: 8, maliciousTrafficMb: 2, packetsPerSecond: 12400 },
  { time: '03:00', totalVolumeMb: 380, normalTrafficMb: 375, suspiciousTrafficMb: 4, maliciousTrafficMb: 1, packetsPerSecond: 9800 },
  { time: '06:00', totalVolumeMb: 510, normalTrafficMb: 495, suspiciousTrafficMb: 12, maliciousTrafficMb: 3, packetsPerSecond: 15600 },
  { time: '09:00', totalVolumeMb: 920, normalTrafficMb: 870, suspiciousTrafficMb: 35, maliciousTrafficMb: 15, packetsPerSecond: 28900 },
  { time: '12:00', totalVolumeMb: 1140, normalTrafficMb: 1020, suspiciousTrafficMb: 85, maliciousTrafficMb: 35, packetsPerSecond: 34100 },
  { time: '15:00', totalVolumeMb: 1480, normalTrafficMb: 1210, suspiciousTrafficMb: 190, maliciousTrafficMb: 80, packetsPerSecond: 45200 },
  { time: '18:00', totalVolumeMb: 1890, normalTrafficMb: 1180, suspiciousTrafficMb: 420, maliciousTrafficMb: 290, packetsPerSecond: 68400 }, // DDoS Spike
  { time: '21:00', totalVolumeMb: 1050, normalTrafficMb: 980, suspiciousTrafficMb: 50, maliciousTrafficMb: 20, packetsPerSecond: 31200 },
];

export const MOCK_ATTACK_CATEGORIES: AttackCategoryDistribution[] = [
  { category: 'DDoS (SYN/UDP Flood)', count: 4850, percentage: 42.5, color: '#DC2626' },
  { category: 'Port Scan / Recon', count: 3120, percentage: 27.3, color: '#D97706' },
  { category: 'Web App Exploits (SQLi/XSS)', count: 1840, percentage: 16.1, color: '#2563EB' },
  { category: 'Ransomware C2 Beacon', count: 980, percentage: 8.6, color: '#7C3AED' },
  { category: 'Brute Force (SSH/RDP)', count: 620, percentage: 5.5, color: '#059669' },
];

export const MOCK_SYSTEM_HEALTH: SystemHealthMetric[] = [
  { component: 'AI Inference Engine (RandomForest + XGBoost)', status: 'Operational', latencyMs: 1.4, cpuUsagePct: 24.2, memoryUsagePct: 41.8, throughputGbps: 10.2 },
  { component: 'PCAP Ingestion Pipeline (eBPF Driver)', status: 'Operational', latencyMs: 0.6, cpuUsagePct: 18.5, memoryUsagePct: 32.1, throughputGbps: 12.5 },
  { component: 'SHAP Feature Attribution Worker', status: 'Operational', latencyMs: 4.8, cpuUsagePct: 38.0, memoryUsagePct: 58.4, throughputGbps: 8.4 },
  { component: 'MITRE Threat Intel Auto-Sync', status: 'Operational', latencyMs: 12.0, cpuUsagePct: 5.2, memoryUsagePct: 14.6, throughputGbps: 1.0 },
];
