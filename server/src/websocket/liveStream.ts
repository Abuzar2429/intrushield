import { Server as HttpServer, IncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { alertService } from '../services/alertService';
import { verifyToken } from '../middleware/authMiddleware';

export interface PacketPayload {
  id: string;
  timestamp: string;
  sourceIp: string;
  sourcePort: number;
  destinationIp: string;
  destinationPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'DNS' | 'HTTP';
  packetSize: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskScore: number;
  predictedAttackType: string;
  status: 'Allowed' | 'Inspected' | 'Flagged' | 'Blocked';
  payloadSample: string;
  ttl: number;
  flowDurationMs: number;
}

const ATTACK_TYPES = [
  { type: 'Normal Traffic', risk: 'Low', status: 'Allowed', scoreMin: 2, scoreMax: 18 },
  { type: 'DDoS SYN Flood Anomaly', risk: 'Critical', status: 'Blocked', scoreMin: 88, scoreMax: 99 },
  { type: 'SSH Brute-Force Recon', risk: 'High', status: 'Flagged', scoreMin: 72, scoreMax: 87 },
  { type: 'DNS Tunneling Probe', risk: 'Medium', status: 'Inspected', scoreMin: 45, scoreMax: 68 },
  { type: 'Port Scan Sweep', risk: 'Medium', status: 'Flagged', scoreMin: 50, scoreMax: 70 },
  { type: 'SQL Injection Payload', risk: 'High', status: 'Blocked', scoreMin: 80, scoreMax: 95 }
];

const PROTOCOLS: ('TCP' | 'UDP' | 'ICMP' | 'DNS' | 'HTTP')[] = ['TCP', 'UDP', 'ICMP', 'DNS', 'HTTP'];

const SOURCE_IPS = [
  '185.220.101.5', '45.142.214.8', '194.26.29.11', '10.0.4.12',
  '192.168.1.105', '172.16.0.44', '103.21.244.0', '91.240.118.17'
];

const TARGET_IPS = ['10.0.4.5', '10.0.4.12', '10.0.4.88', '10.0.4.100'];

function generateRandomPacket(): PacketPayload {
  const attackObj = Math.random() > 0.4 ? ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)] : ATTACK_TYPES[0];
  const protocol = PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)];
  const srcIp = SOURCE_IPS[Math.floor(Math.random() * SOURCE_IPS.length)];
  const dstIp = TARGET_IPS[Math.floor(Math.random() * TARGET_IPS.length)];
  const srcPort = Math.floor(1024 + Math.random() * 60000);
  const dstPort = [80, 443, 22, 53, 8080][Math.floor(Math.random() * 5)];
  const score = Math.floor(attackObj.scoreMin + Math.random() * (attackObj.scoreMax - attackObj.scoreMin));
  const packetSize = Math.floor(64 + Math.random() * 1400);

  return {
    id: `PKT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    sourceIp: srcIp,
    sourcePort: srcPort,
    destinationIp: dstIp,
    destinationPort: dstPort,
    protocol,
    packetSize,
    riskLevel: attackObj.risk as any,
    riskScore: score,
    predictedAttackType: attackObj.type,
    status: attackObj.status as any,
    payloadSample: `[RAW ${protocol}] 0x${Math.floor(Math.random() * 16777215).toString(16)} SEQ=${Math.floor(Math.random() * 100000)} WIN=64240`,
    ttl: [64, 128, 54, 118][Math.floor(Math.random() * 4)],
    flowDurationMs: Number((Math.random() * 120 + 5).toFixed(2))
  };
}

export function setupLiveStreamWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  console.log('[WEBSOCKET] IntruShield Telemetry Live Stream initialized on /ws');

  let isStreaming = true;

  // Subscribe alertService to WebSocket broadcasts
  alertService.subscribe((alertPayload) => {
    const alertMsg = JSON.stringify({ type: 'CRITICAL_ALERT', payload: alertPayload });
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(alertMsg);
      }
    });
  });

  const interval = setInterval(() => {
    if (!isStreaming || wss.clients.size === 0) return;

    const packet = generateRandomPacket();
    const message = JSON.stringify({ type: 'PACKET_TELEMETRY', payload: packet });

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    // Dispatch alert if packet threat score crosses critical threshold
    if (packet.riskScore >= 90 && packet.riskLevel === 'Critical') {
      alertService.dispatchAlert({
        alertId: `ALT-${Date.now().toString(36).toUpperCase()}`,
        incidentCode: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title: packet.predictedAttackType,
        severity: 'Critical',
        threatScore: packet.riskScore,
        sourceIp: packet.sourceIp,
        targetIp: packet.destinationIp,
        timestamp: packet.timestamp,
        description: `Automated ML Classifier detected high probability ${packet.predictedAttackType} from ${packet.sourceIp}`,
        recommendedAction: `Enforce BGP Flowspec rate limit or iptables drop rule on ${packet.sourceIp}`,
      });
    }
  }, 400);

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const requestUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    const token = requestUrl.searchParams.get('token');
    const user = token ? verifyToken(token) : null;

    if (!user) {
      console.warn('[WEBSOCKET] Unauthenticated WebSocket connection rejected.');
      ws.close(4001, 'Unauthorized: Invalid or missing token');
      return;
    }

    console.log(`[WEBSOCKET] Client connected as ${user.email} (${user.role}).`);

    // Send initial status message
    ws.send(JSON.stringify({
      type: 'SYSTEM_STATUS',
      payload: { status: 'CONNECTED', message: 'IntruShield Telemetry Engine Active', user: user.email }
    }));

    ws.on('message', (data: string) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.action === 'PAUSE') {
          isStreaming = false;
          ws.send(JSON.stringify({ type: 'CONTROL_ACK', status: 'PAUSED' }));
        } else if (parsed.action === 'RESUME') {
          isStreaming = true;
          ws.send(JSON.stringify({ type: 'CONTROL_ACK', status: 'RESUMING' }));
        }
      } catch (_err) {
        // Ignore unparseable control messages
      }
    });

    ws.on('close', () => {
      console.log('[WEBSOCKET] Client disconnected.');
    });
  });

  return wss;
}
