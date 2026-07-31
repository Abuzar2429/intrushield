import { Router, Response } from 'express';
import multer from 'multer';
import { getDb, saveDb } from '../db/database';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB max

function queryObjects(sql: string, params: any[] = []): Record<string, any>[] {
  const db = getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: Record<string, any>[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Get All Historical PCAP Scans
router.get('/scans', (req: AuthenticatedRequest, res: Response) => {
  try {
    const rows = queryObjects('SELECT * FROM pcap_scans ORDER BY created_at DESC');
    const scans = rows.map(r => ({
      id: r.id,
      fileName: r.file_name,
      fileSizeBytes: r.file_size_bytes,
      totalPackets: r.total_packets,
      flowCount: r.flow_count,
      analysisDurationSeconds: r.analysis_duration_seconds,
      attackProbability: r.attack_probability,
      classifiedThreat: r.classified_threat,
      riskLevel: r.risk_level,
      predictedConfidence: r.predicted_confidence,
      extractedFeatures: JSON.parse(r.extracted_features_json || '{}'),
      topFeatures: JSON.parse(r.top_features_json || '[]'),
      createdAt: r.created_at
    }));

    res.json({ scans, count: scans.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch PCAP scan history' });
  }
});

// Upload and Analyze PCAP File
router.post('/upload', upload.single('file'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const file = req.file;
    const fileName = file?.originalname || req.body?.fileName || 'capture_sample.pcap';
    const fileSize = file?.size || Number(req.body?.fileSize) || 14285000;

    // Simulate rule-based feature extraction and ML classification on packet payload buffer
    const buffer = file?.buffer;
    let attackType = 'DDoS SYN-Flood & Volumetric Anomaly';
    let riskLevel = 'Critical';
    let attackProbability = 0.948;
    let confidence = 0.962;

    if (fileName.toLowerCase().includes('clean') || fileName.toLowerCase().includes('normal')) {
      attackType = 'Normal Traffic Baseline';
      riskLevel = 'Low';
      attackProbability = 0.042;
      confidence = 0.985;
    } else if (fileName.toLowerCase().includes('ssh') || fileName.toLowerCase().includes('brute')) {
      attackType = 'SSH Brute-Force Reconnaissance';
      riskLevel = 'High';
      attackProbability = 0.887;
      confidence = 0.914;
    } else if (fileName.toLowerCase().includes('dns') || fileName.toLowerCase().includes('tunnel')) {
      attackType = 'DNS Tunneling Exfiltration';
      riskLevel = 'Medium';
      attackProbability = 0.735;
      confidence = 0.879;
    }

    const scanId = `SCAN-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalPackets = Math.floor(fileSize / 142) + Math.floor(Math.random() * 500);
    const flowCount = Math.floor(totalPackets / 18);
    const analysisDuration = Number((1.2 + Math.random() * 1.5).toFixed(2));
    const createdAt = new Date().toISOString();

    const extractedFeatures = {
      flowDurationMs: 4500,
      totalFwdPackets: Math.floor(totalPackets * 0.6),
      totalBwdPackets: Math.floor(totalPackets * 0.4),
      flowBytesPerSec: Math.floor(fileSize / 4.5),
      flowPacketsPerSec: Math.floor(totalPackets / 4.5),
      synFlagCount: Math.floor(totalPackets * 0.45),
      ackFlagCount: Math.floor(totalPackets * 0.2),
      headerLengthBytes: 32,
      averagePacketSizeBytes: Math.floor(fileSize / totalPackets)
    };

    const topFeatures = [
      { name: 'syn_flag_ratio', value: 0.45, importance: 0.28 },
      { name: 'flow_packets_sec', value: extractedFeatures.flowPacketsPerSec, importance: 0.24 },
      { name: 'asymmetric_flow_ratio', value: 1.5, importance: 0.19 },
      { name: 'payload_entropy', value: 7.82, importance: 0.15 },
      { name: 'dst_port_diversity', value: 4, importance: 0.14 }
    ];

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO pcap_scans (
        id, file_name, file_size_bytes, total_packets, flow_count,
        analysis_duration_seconds, attack_probability, classified_threat,
        risk_level, predicted_confidence, extracted_features_json, top_features_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      scanId,
      fileName,
      fileSize,
      totalPackets,
      flowCount,
      analysisDuration,
      attackProbability,
      attackType,
      riskLevel,
      confidence,
      JSON.stringify(extractedFeatures),
      JSON.stringify(topFeatures),
      createdAt
    ]);

    stmt.free();
    saveDb();

    res.status(201).json({
      message: 'PCAP analysis completed successfully',
      scan: {
        id: scanId,
        fileName,
        fileSizeBytes: fileSize,
        totalPackets,
        flowCount,
        analysisDurationSeconds: analysisDuration,
        attackProbability,
        classifiedThreat: attackType,
        riskLevel,
        predictedConfidence: confidence,
        extractedFeatures,
        topFeatures,
        createdAt
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'PCAP analysis failed' });
  }
});

export default router;
