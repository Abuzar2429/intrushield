import type { Incident } from '../types/incident';

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-01',
    incidentCode: 'INC-2026-8901',
    title: 'Volumetric Distributed SYN Flood Attack on Edge Gateway',
    category: 'DDoS Attack',
    riskLevel: 'Critical',
    riskScore: 96,
    confidenceScore: 99.2,
    detectedAt: '2026-07-29T21:04:12Z',
    updatedAt: '2026-07-29T21:15:00Z',
    status: 'Investigating',
    primaryAttackerIp: '185.220.101.44',
    targetedHostIp: '10.0.4.12',
    affectedSystemsCount: 4,
    timeline: [
      {
        id: 'tl-1',
        timestamp: '21:04:12',
        title: 'Anomaly Triggered',
        description: 'Random Forest model flagged 450,000 SYN packets/sec with zero ACK responses.',
        severity: 'Critical',
        source: 'AI Ensemble Engine'
      },
      {
        id: 'tl-2',
        timestamp: '21:04:18',
        title: 'Automatic Firewall Throttling Applied',
        description: 'Edge BGP rate-limiting activated on subnet 10.0.4.0/24.',
        severity: 'High',
        source: 'Automated SOC Playbook'
      },
      {
        id: 'tl-3',
        timestamp: '21:08:45',
        title: 'Attacker IP Cluster Identified',
        description: 'Source IPs correlated with known Mirai botnet C2 nodes.',
        severity: 'High',
        source: 'Threat Intel Matcher'
      },
      {
        id: 'tl-4',
        timestamp: '21:15:00',
        title: 'Analyst Triage In Progress',
        description: 'Senior SOC Engineer reviewing traffic mitigation rules.',
        severity: 'Medium',
        source: 'Human Operator'
      }
    ],
    explanation: {
      naturalLanguageReasoning: 'The AI model detected an extreme imbalance in SYN flag frequency relative to completed TCP three-way handshakes (SYN-to-ACK ratio > 98:1). Combined with spoofed source IPs and high packet volume per flow, the model classifies this event as a Volumetric SYN Flood DDoS with 99.2% confidence.',
      shapWaterfall: [
        { featureName: 'SYN Flag Ratio', description: 'Percentage of SYN flags in TCP flows', value: '98.4%', impactScore: 0.45 },
        { featureName: 'Flow Packets/Sec', description: 'Incoming packet rate', value: '45,200 pps', impactScore: 0.32 },
        { featureName: 'Bwd Packet Length Std', description: 'Standard deviation of response size', value: '0.00', impactScore: 0.18 },
        { featureName: 'Unique Source Subnets', description: 'Geographic dispersal of origin IPs', value: '1,420 /16s', impactScore: 0.12 },
        { featureName: 'Payload Size Zero', description: 'Packets with no application layer payload', value: '100%', impactScore: 0.08 }
      ],
      confidenceDistribution: [
        { label: 'DDoS (SYN Flood)', value: 99.2 },
        { label: 'Port Scan Cluster', value: 0.5 },
        { label: 'Benign Traffic Spike', value: 0.3 }
      ]
    },
    evidencePackets: [
      {
        id: 'pkt-901',
        timestamp: '21:04:12.102',
        sourceIp: '185.220.101.44',
        sourcePort: 49152,
        destinationIp: '10.0.4.12',
        destinationPort: 443,
        protocol: 'TCP',
        packetSize: 1460,
        riskLevel: 'Critical',
        riskScore: 96,
        predictedAttackType: 'DDoS (SYN Flood)',
        status: 'Dropped',
        payloadSample: '4500 003c 1a2b 4000 4006 7c11 c0a8 0101 c0a8 0102 ... [SYN]',
        flags: ['SYN']
      },
      {
        id: 'pkt-901b',
        timestamp: '21:04:12.104',
        sourceIp: '185.220.101.45',
        sourcePort: 49153,
        destinationIp: '10.0.4.12',
        destinationPort: 443,
        protocol: 'TCP',
        packetSize: 1460,
        riskLevel: 'Critical',
        riskScore: 96,
        predictedAttackType: 'DDoS (SYN Flood)',
        status: 'Dropped',
        payloadSample: '4500 003c 1a2c 4000 4006 7c10 c0a8 0101 c0a8 0102 ... [SYN]',
        flags: ['SYN']
      }
    ],
    remediationActions: [
      {
        id: 'act-1',
        actionTitle: 'Block Subnet on Edge Firewall',
        category: 'Firewall Rule',
        target: '185.220.101.0/24',
        executed: true,
        executedAt: '21:05:00Z',
        recommendedReason: 'Automated block rule applied for top offending subnet.'
      },
      {
        id: 'act-2',
        actionTitle: 'Enable Cloudflare DDoS Scrubbing Mode',
        category: 'Traffic Throttling',
        target: '10.0.4.12 (Public Gateway)',
        executed: false,
        recommendedReason: 'Reroute incoming HTTPS traffic through Anycast scrubbing center.'
      },
      {
        id: 'act-3',
        actionTitle: 'Notify Infrastructure On-Call Team',
        category: 'Host Isolation',
        target: 'PagerDuty SOC Channel',
        executed: true,
        executedAt: '21:04:30Z',
        recommendedReason: 'High urgency notification triggered.'
      }
    ]
  },
  {
    id: 'inc-02',
    incidentCode: 'INC-2026-8894',
    title: 'Cobalt Strike C2 Beaconing Detected from Internal Server',
    category: 'Ransomware C2',
    riskLevel: 'Critical',
    riskScore: 94,
    confidenceScore: 97.8,
    detectedAt: '2026-07-29T19:30:00Z',
    updatedAt: '2026-07-29T20:12:00Z',
    status: 'Open',
    primaryAttackerIp: '10.0.1.100',
    targetedHostIp: '185.190.140.22',
    affectedSystemsCount: 1,
    timeline: [
      {
        id: 'tl-10',
        timestamp: '19:30:00',
        title: 'Periodic Outbound Beaconing Flagged',
        description: 'Deep Packet Inspection model detected 60-second jittered TCP connections to external IP.',
        severity: 'Critical',
        source: 'XAI Temporal Model'
      }
    ],
    explanation: {
      naturalLanguageReasoning: 'Outbound TCP connection from internal database workstation (10.0.1.100) exhibits characteristic Cobalt Strike Malleable C2 profile: regular interval heartbeats with randomized payload padding and self-signed SSL TLS handshake.',
      shapWaterfall: [
        { featureName: 'Beacon Time Jitter', description: 'Regular heartbeat interval', value: '59.8s ± 1.2s', impactScore: 0.48 },
        { featureName: 'SSL Certificate Issuer', description: 'Self-signed untrusted CA', value: 'Untrusted', impactScore: 0.30 },
        { featureName: 'Destination Threat Match', description: 'Known C2 infrastructure feed match', value: 'Match', impactScore: 0.22 }
      ],
      confidenceDistribution: [
        { label: 'Ransomware C2 Beacon', value: 97.8 },
        { label: 'Data Exfiltration', value: 1.8 },
        { label: 'Misconfigured Service', value: 0.4 }
      ]
    },
    evidencePackets: [],
    remediationActions: [
      {
        id: 'act-20',
        actionTitle: 'Isolate Host 10.0.1.100 from LAN',
        category: 'Host Isolation',
        target: '10.0.1.100',
        executed: false,
        recommendedReason: 'Prevent lateral movement to corporate active directory.'
      }
    ]
  },
  {
    id: 'inc-03',
    incidentCode: 'INC-2026-8840',
    title: 'SQL Injection Campaign Against User Portal API',
    category: 'SQL Injection',
    riskLevel: 'High',
    riskScore: 84,
    confidenceScore: 94.5,
    detectedAt: '2026-07-29T18:12:00Z',
    updatedAt: '2026-07-29T18:45:00Z',
    status: 'Mitigated',
    primaryAttackerIp: '192.168.1.105',
    targetedHostIp: '10.0.1.5',
    affectedSystemsCount: 2,
    timeline: [],
    explanation: {
      naturalLanguageReasoning: 'HTTP GET payload contained malicious SQL syntax tokens (`UNION SELECT`, `password_hash`, `--`) attempting database schema extraction.',
      shapWaterfall: [
        { featureName: 'SQL Syntax Keyword Ratio', description: 'Detected reserved SQL keywords', value: 'High', impactScore: 0.52 }
      ],
      confidenceDistribution: [
        { label: 'SQL Injection', value: 94.5 },
        { label: 'Cross-Site Scripting', value: 3.2 }
      ]
    },
    evidencePackets: [],
    remediationActions: []
  }
];
