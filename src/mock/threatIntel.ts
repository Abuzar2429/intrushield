import type { MitreTechnique, ThreatActorFeed, CVEItem } from '../types/threat';

export const MOCK_MITRE_TECHNIQUES: MitreTechnique[] = [
  {
    id: 'T1046',
    tactic: 'Reconnaissance',
    name: 'Network Service Discovery',
    description: 'Adversaries may attempt to get a listing of services running on remote hosts to identify targetable vulnerabilities.',
    detectedCount: 412,
    riskLevel: 'Medium',
    mitigation: 'Filter network traffic between subnets to limit port scan visibility.'
  },
  {
    id: 'T1498',
    tactic: 'Impact',
    name: 'Network Denial of Service',
    description: 'Adversaries may perform Network DoS attacks to degrade or block availability of targeted services.',
    detectedCount: 89,
    riskLevel: 'Critical',
    mitigation: 'Deploy upstream Cloudflare / AWS Shield DDoS mitigation and BGP flowspec rate-limiting.'
  },
  {
    id: 'T1071',
    tactic: 'Command and Control',
    name: 'Application Layer Protocol C2',
    description: 'Adversaries may communicate using application layer protocols (HTTP/S, DNS) to blend in with normal network traffic.',
    detectedCount: 34,
    riskLevel: 'Critical',
    mitigation: 'Enforce SSL inspection and ML-based beaconing detection on egress firewalls.'
  },
  {
    id: 'T1190',
    tactic: 'Initial Access',
    name: 'Exploit Public-Facing Application',
    description: 'Adversaries may attempt to exploit vulnerabilities in internet-facing web applications or web services.',
    detectedCount: 156,
    riskLevel: 'High',
    mitigation: 'Implement Web Application Firewall (WAF) rules and keep web frameworks patched.'
  },
  {
    id: 'T1059',
    tactic: 'Execution',
    name: 'Command and Scripting Interpreter',
    description: 'Adversaries may abuse command and script interpreters to execute commands, scripts, or binaries.',
    detectedCount: 78,
    riskLevel: 'High',
    mitigation: 'Restrict PowerShell and bash execution policies via Endpoint Detection & Response (EDR).'
  }
];

export const MOCK_THREAT_ACTORS: ThreatActorFeed[] = [
  {
    id: 'apt-29',
    name: 'APT29 (Midnight Blizzard)',
    alias: 'Cozy Bear / Nobelium',
    originCountry: 'Eastern Europe',
    targetIndustries: ['Government', 'Defense', 'Energy', 'Cybersecurity'],
    firstSeen: '2014',
    lastActive: '2026-07-28',
    threatLevel: 'Critical',
    description: 'Highly sophisticated cyber espionage group known for supply chain attacks and advanced C2 stealth.',
    associatedCVEs: ['CVE-2024-21887', 'CVE-2023-38831'],
    associatedIOCs: ['185.190.140.22', 'malicious-c2-node.org']
  },
  {
    id: 'apt-41',
    name: 'APT41 (Brass Typhoon)',
    alias: 'Double Dragon / Wicked Panda',
    originCountry: 'East Asia',
    targetIndustries: ['Healthcare', 'Telecom', 'Finance', 'Software'],
    firstSeen: '2012',
    lastActive: '2026-07-25',
    threatLevel: 'High',
    description: 'Dual espionage and financially motivated group specializing in web application exploitation and web shells.',
    associatedCVEs: ['CVE-2023-22515', 'CVE-2021-44228'],
    associatedIOCs: ['91.240.118.50', '45.142.214.12']
  }
];

export const MOCK_CVES: CVEItem[] = [
  {
    id: 'CVE-2026-1184',
    cvssScore: 9.8,
    severity: 'Critical',
    affectedProtocol: 'HTTP/2 & QUIC',
    summary: 'Unauthenticated Remote Code Execution in high-throughput HTTP proxy handling chunked frame headers.',
    publishedDate: '2026-06-15',
    mitigationSteps: 'Upgrade reverse proxy software to v4.12.0+ or apply WAF chunked-payload inspection rule.',
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2026-1184', 'https://intrushield.io/advisories/IS-2026-04']
  },
  {
    id: 'CVE-2025-49210',
    cvssScore: 8.5,
    severity: 'High',
    affectedProtocol: 'OpenSSH / TCP',
    summary: 'Race condition vulnerability in OpenSSH server signal handler leading to potential privilege escalation.',
    publishedDate: '2025-11-02',
    mitigationSteps: 'Set LoginGraceTime to 0 in sshd_config or upgrade to OpenSSH 9.8p1.',
    references: ['https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2025-49210']
  }
];
