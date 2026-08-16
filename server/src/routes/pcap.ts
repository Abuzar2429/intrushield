import { Router, Response } from 'express';
import multer from 'multer';
import { getDb, saveDb } from '../db/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { classifyNetworkFlow, MLInferenceResult } from '../ml/inferenceEngine';
import { extractFlowsFromPcap, NetworkFlowFeatures } from '../ml/pcapParser';

const router = Router();
const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file limit
});

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

/**
 * Required CSV headers for CIC-IDS feature verification
 */
const REQUIRED_CSV_FEATURES = [
  'flowdurationms',
  'totalfwdpackets',
  'totalbwdpackets',
  'flowbytespersec',
  'flowpacketspersec',
  'synflagcount',
];

/**
 * Validates CSV header strings against required feature columns
 */
function validateCsvHeaders(headerRow: string): { isValid: boolean; missingColumns: string[] } {
  const normalizedHeaders = headerRow.toLowerCase().split(',').map(h => h.trim().replace(/["']/g, '').replace(/[\s_/]/g, ''));
  const missing: string[] = [];

  for (const feature of REQUIRED_CSV_FEATURES) {
    if (!normalizedHeaders.some(h => h.includes(feature) || feature.includes(h))) {
      missing.push(feature);
    }
  }

  return {
    isValid: missing.length === 0,
    missingColumns: missing,
  };
}

/**
 * Parses raw CSV content buffer into flow feature objects
 */
function parseCsvBuffer(buffer: Buffer): Partial<NetworkFlowFeatures>[] {
  const content = buffer.toString('utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) {
    throw new Error('CSV file is empty or contains no data rows.');
  }

  const headerValidation = validateCsvHeaders(lines[0]);
  if (!headerValidation.isValid) {
    throw new Error(`CSV file missing required feature columns: ${headerValidation.missingColumns.join(', ')}`);
  }

  const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/["']/g, '').replace(/[\s_/]/g, ''));
  const getColIdx = (name: string) => headers.findIndex(h => h.includes(name));

  const durationIdx = getColIdx('flowdurationms');
  const fwdPktIdx = getColIdx('totalfwdpackets');
  const bwdPktIdx = getColIdx('totalbwdpackets');
  const bytesPerSecIdx = getColIdx('flowbytespersec');
  const pktsPerSecIdx = getColIdx('flowpacketspersec');
  const synIdx = getColIdx('synflagcount');
  const entropyIdx = getColIdx('payloadentropy');

  const flows: Partial<NetworkFlowFeatures>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    if (cols.length < headers.length) continue;

    const flowDurationMs = parseFloat(cols[durationIdx]) || 1000;
    const totalFwdPackets = parseInt(cols[fwdPktIdx], 10) || 1;
    const totalBwdPackets = parseInt(cols[bwdPktIdx], 10) || 0;
    const flowBytesPerSec = parseFloat(cols[bytesPerSecIdx]) || 0;
    const flowPacketsPerSec = parseFloat(cols[pktsPerSecIdx]) || 0;
    const synFlagCount = parseInt(cols[synIdx], 10) || 0;
    const payloadEntropy = entropyIdx >= 0 ? parseFloat(cols[entropyIdx]) || 5.0 : 5.0;

    const totalPackets = Math.max(1, totalFwdPackets + totalBwdPackets);

    flows.push({
      flowDurationMs,
      totalFwdPackets,
      totalBwdPackets,
      flowBytesPerSec,
      flowPacketsPerSec,
      synFlagCount,
      synFlagRatio: Number((synFlagCount / totalPackets).toFixed(3)),
      payloadEntropy,
      asymmetricRatio: Number((totalFwdPackets / Math.max(1, totalBwdPackets)).toFixed(2)),
    });
  }

  return flows;
}

/**
 * @route GET /api/pcap/scans
 * @desc Fetch historical PCAP / CSV analysis scans
 * @access Private
 */
router.get('/scans', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const isClient = req.user?.role === 'Client';
    const userId = req.user?.id;

    const sql = isClient
      ? 'SELECT * FROM pcap_scans WHERE user_id = ? ORDER BY created_at DESC'
      : 'SELECT * FROM pcap_scans ORDER BY created_at DESC';
    const params = isClient ? [userId] : [];

    const rows = queryObjects(sql, params);
    const scans = rows.map(r => ({
      id: r.id,
      userId: r.user_id,
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
      createdAt: r.created_at,
    }));

    res.json({ scans, count: scans.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch PCAP scan history' });
  }
});

/**
 * @route POST /api/pcap/upload
 * @desc Ingest and analyze real PCAP, PCAPNG, or CSV files
 * @access Private
 */
router.post('/upload', requireAuth, upload.single('file'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file || !file.buffer) {
      res.status(400).json({ error: 'No file uploaded. Please attach a valid .pcap, .pcapng, or .csv file.' });
      return;
    }

    const fileName = file.originalname || 'analysis_capture.pcap';
    const fileSize = file.size;
    const lowerName = fileName.toLowerCase();

    let totalPackets = 0;
    let flowCount = 0;
    let primaryMlResult: MLInferenceResult;
    let extractedFeaturesSummary: Record<string, any> = {};

    const startTime = Date.now();

    if (lowerName.endsWith('.csv')) {
      // Process CSV feature file
      const csvFlows = parseCsvBuffer(file.buffer);
      flowCount = csvFlows.length;
      totalPackets = csvFlows.reduce((acc, f) => acc + (f.totalFwdPackets || 0) + (f.totalBwdPackets || 0), 0);

      // Evaluate highest-risk flow
      let highestRiskFlow = csvFlows[0] || {};
      let highestProbability = 0;

      for (const flow of csvFlows) {
        const res = classifyNetworkFlow(flow);
        if (res.attackProbability > highestProbability) {
          highestProbability = res.attackProbability;
          highestRiskFlow = flow;
        }
      }

      primaryMlResult = classifyNetworkFlow(highestRiskFlow);
      extractedFeaturesSummary = {
        inputType: 'CSV Network Flow Feature Vector',
        totalFlowsAnalyzed: flowCount,
        ...primaryMlResult.extractedFeatures,
      };
    } else {
      // Process binary PCAP / PCAPNG buffer
      const pcapResult = extractFlowsFromPcap(fileName, file.buffer);
      totalPackets = pcapResult.totalPackets;
      flowCount = pcapResult.flows.length;

      let targetFlow: Partial<NetworkFlowFeatures> = {};
      let maxRisk = -1;

      for (const flow of pcapResult.flows) {
        const evalRes = classifyNetworkFlow(flow);
        if (evalRes.attackProbability > maxRisk) {
          maxRisk = evalRes.attackProbability;
          targetFlow = flow;
        }
      }

      if (pcapResult.flows.length === 0) {
        // Fallback for packet captures with non-IP frames
        targetFlow = {
          flowDurationMs: 1000,
          totalFwdPackets: totalPackets,
          totalBwdPackets: 0,
          flowPacketsPerSec: totalPackets,
        };
      }

      primaryMlResult = classifyNetworkFlow(targetFlow);
      extractedFeaturesSummary = {
        inputType: 'Binary PCAP Frame Aggregation',
        parsedPacketsCount: totalPackets,
        aggregatedFlowsCount: flowCount,
        primaryProtocol: pcapResult.summary.primaryProtocol,
        ...primaryMlResult.extractedFeatures,
      };
    }

    const analysisDuration = Number(((Date.now() - startTime) / 1000 + 0.15).toFixed(2));
    const scanId = `SCAN-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = new Date().toISOString();

    const topFeaturesMapped = primaryMlResult.topFeatures.map(f => ({
      name: f.featureName,
      value: f.value,
      importance: f.impactScore,
      description: f.description,
      direction: f.direction,
    }));

    const uId = req.user?.id || null;
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO pcap_scans (
        id, user_id, file_name, file_size_bytes, total_packets, flow_count,
        analysis_duration_seconds, attack_probability, classified_threat,
        risk_level, predicted_confidence, extracted_features_json, top_features_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      scanId,
      uId,
      fileName,
      fileSize,
      totalPackets,
      flowCount,
      analysisDuration,
      primaryMlResult.attackProbability,
      primaryMlResult.classifiedThreat,
      primaryMlResult.riskLevel,
      primaryMlResult.predictedConfidence,
      JSON.stringify(extractedFeaturesSummary),
      JSON.stringify(topFeaturesMapped),
      createdAt,
    ]);

    stmt.free();
    saveDb();

    res.status(201).json({
      message: 'Network file analysis completed successfully',
      scan: {
        id: scanId,
        fileName,
        fileSizeBytes: fileSize,
        totalPackets,
        flowCount,
        analysisDurationSeconds: analysisDuration,
        attackProbability: primaryMlResult.attackProbability,
        classifiedThreat: primaryMlResult.classifiedThreat,
        riskLevel: primaryMlResult.riskLevel,
        predictedConfidence: primaryMlResult.predictedConfidence,
        mitreMapping: primaryMlResult.mitreMapping,
        extractedFeatures: extractedFeaturesSummary,
        topFeatures: topFeaturesMapped,
        createdAt,
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Network file analysis failed' });
  }
});

export default router;
