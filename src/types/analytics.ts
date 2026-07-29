export interface TrafficDataPoint {
  time: string;
  totalVolumeMb: number;
  normalTrafficMb: number;
  suspiciousTrafficMb: number;
  maliciousTrafficMb: number;
  packetsPerSecond: number;
}

export interface AttackCategoryDistribution {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface SystemHealthMetric {
  component: string;
  status: 'Operational' | 'Degraded' | 'Maintenance' | 'Down';
  latencyMs: number;
  cpuUsagePct: number;
  memoryUsagePct: number;
  throughputGbps: number;
}
