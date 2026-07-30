import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Packet, PCAPAnalysisResult } from '../types/packet';
import type { Incident } from '../types/incident';
import { MOCK_PACKETS } from '../mock/packets';
import { MOCK_INCIDENTS } from '../mock/incidents';

interface MonitoringContextType {
  packets: Packet[];
  isLiveStreaming: boolean;
  toggleLiveStreaming: () => void;
  incidents: Incident[];
  activeIncident: Incident | null;
  setActiveIncident: (incident: Incident | null) => void;
  pcapResult: PCAPAnalysisResult | null;
  analyzePcap: (file: File | string) => void;
  clearPcapResult: () => void;
  threatScore: number;
  packetsPerSec: number;
}

const MonitoringContext = createContext<MonitoringContextType | undefined>(undefined);

export const MonitoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [packets, setPackets] = useState<Packet[]>(MOCK_PACKETS);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [incidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(MOCK_INCIDENTS[0]);
  const [pcapResult, setPcapResult] = useState<PCAPAnalysisResult | null>(null);
  const [threatScore, setThreatScore] = useState<number>(28);
  const [packetsPerSec, setPacketsPerSec] = useState<number>(34100);

  // Live packet stream simulation interval
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      const randomIpSuffix = Math.floor(Math.random() * 254) + 1;
      const randomPort = [80, 443, 22, 53, 8080, 3389][Math.floor(Math.random() * 6)];
      const protocols: ('TCP' | 'UDP' | 'HTTP' | 'DNS')[] = ['TCP', 'UDP', 'HTTP', 'DNS'];
      const protocol = protocols[Math.floor(Math.random() * protocols.length)];

      const isAnomaly = Math.random() < 0.15; // 15% chance of suspicious/critical packet
      const riskLevel = isAnomaly 
        ? (Math.random() < 0.3 ? 'Critical' : 'High') 
        : (Math.random() < 0.2 ? 'Medium' : 'Normal');

      const now = new Date();
      const timeStr = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3, hour12: false
      }).format(now);

      const newPacket: Packet = {
        id: `pkt-${crypto.randomUUID()}`,
        timestamp: timeStr,
        sourceIp: isAnomaly ? `185.220.${Math.floor(Math.random()*100)}.${randomIpSuffix}` : `10.0.0.${randomIpSuffix}`,
        sourcePort: 49000 + Math.floor(Math.random() * 10000),
        destinationIp: '10.0.4.12',
        destinationPort: randomPort,
        protocol: protocol,
        packetSize: Math.floor(Math.random() * 1400) + 64,
        riskLevel: riskLevel,
        riskScore: riskLevel === 'Critical' ? 95 : riskLevel === 'High' ? 78 : riskLevel === 'Medium' ? 45 : 4,
        predictedAttackType: isAnomaly ? (riskLevel === 'Critical' ? 'SYN Flood Anomaly' : 'Port Reconnaissance') : 'Benign Traffic',
        status: riskLevel === 'Critical' ? 'Dropped' : riskLevel === 'High' ? 'Flagged' : 'Passed',
        payloadSample: isAnomaly ? `[ALERT] Anomaly in flow duration & payload entropy` : `[NORMAL] ${protocol} payload OK`,
        flags: isAnomaly ? ['SYN', 'ECE'] : ['ACK'],
        ttl: 64,
        flowDurationMs: Number((Math.random() * 10).toFixed(2))
      };

      setPackets(prev => [newPacket, ...prev.slice(0, 49)]); // Keep latest 50 packets

      // Dynamically fluctuate threat score and pps slightly
      setPacketsPerSec(Math.floor(34000 + (Math.random() * 2000 - 1000)));
      if (isAnomaly && riskLevel === 'Critical') {
        setThreatScore(prev => Math.min(100, prev + 1));
      } else {
        setThreatScore(prev => Math.max(15, prev - 0.2));
      }

    }, 2500);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  const toggleLiveStreaming = () => {
    setIsLiveStreaming(prev => !prev);
  };

  const analyzePcap = (file: File | string) => {
    const fileNameStr = typeof file === 'string' ? file : file.name;
    const isDdosSample = fileNameStr.toLowerCase().includes('ddos') || fileNameStr.toLowerCase().includes('syn');

    const result: PCAPAnalysisResult = {
      fileName: fileNameStr,
      fileSizeBytes: typeof file === 'object' ? file.size : 14285000,
      totalPackets: isDdosSample ? 452100 : 124000,
      flowCount: isDdosSample ? 8420 : 3100,
      analysisDurationSeconds: 1.4,
      attackProbability: isDdosSample ? 0.984 : 0.042,
      classifiedThreat: isDdosSample ? 'Volumetric SYN Flood DDoS' : 'Normal Network Trace',
      riskLevel: isDdosSample ? 'Critical' : 'Normal',
      predictedConfidence: isDdosSample ? 0.991 : 0.985,
      extractedFeatures: [
        { name: 'Flow Duration', value: '1.42s', unit: 'sec' },
        { name: 'Total Forward Packets', value: isDdosSample ? 412000 : 62000 },
        { name: 'Total Backward Packets', value: isDdosSample ? 40100 : 62000 },
        { name: 'Flow Bytes/s', value: isDdosSample ? '184.2 MB/s' : '12.4 MB/s' },
        { name: 'Flow Packets/s', value: isDdosSample ? '318,300' : '87,300' },
        { name: 'SYN Flag Count', value: isDdosSample ? 398200 : 1240 },
        { name: 'ACK Flag Count', value: isDdosSample ? 42100 : 123800 },
        { name: 'Average Packet Size', value: isDdosSample ? '1,420 bytes' : '512 bytes' },
        { name: 'Payload Entropy (Bits/Byte)', value: isDdosSample ? 7.82 : 3.12 },
        { name: 'Subnet Dispersion Score', value: isDdosSample ? 0.92 : 0.14 }
      ],
      topContributingFeatures: isDdosSample
        ? [
            { featureName: 'SYN Flag Ratio', description: 'Ratio of SYN flags to total TCP control flags', value: '94.2%', impactScore: 0.48 },
            { featureName: 'Asymmetric Flow Packet Ratio', description: 'Disproportionate forward vs backward packet counts', value: '10.2:1', impactScore: 0.31 },
            { featureName: 'Flow Packets/Sec', description: 'Extremely high packet rate per second', value: '318,300 pps', impactScore: 0.24 },
            { featureName: 'Destination Port 443 Focus', description: 'Targeting single HTTPS port', value: '10.0.4.12:443', impactScore: 0.15 }
          ]
        : [
            { featureName: 'Symmetric Handshakes', description: 'Normal 3-way handshakes completed', value: '99.8%', impactScore: -0.42 },
            { featureName: 'Expected Protocol Ratios', description: 'Balanced HTTP/HTTPS/DNS traffic', value: 'Standard', impactScore: -0.35 }
          ]
    };

    setPcapResult(result);
  };

  const clearPcapResult = () => {
    setPcapResult(null);
  };

  return (
    <MonitoringContext.Provider
      value={{
        packets,
        isLiveStreaming,
        toggleLiveStreaming,
        incidents,
        activeIncident,
        setActiveIncident,
        pcapResult,
        analyzePcap,
        clearPcapResult,
        threatScore: Math.round(threatScore),
        packetsPerSec,
      }}
    >
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoring = () => {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
};
