import { Router, Response } from 'express';
import { z } from 'zod';
import { getDb, saveDb } from '../db/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

const createIncidentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']),
  status: z.string().optional(),
  sourceIp: z.string().min(1, 'Source IP is required'),
  targetIp: z.string().min(1, 'Target IP is required'),
  threatScore: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
  mitigationStatus: z.string().optional(),
});

const patchStatusSchema = z.object({
  status: z.string().optional(),
  mitigationStatus: z.string().optional(),
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
 * @route GET /api/incidents
 * @desc Fetch filtered list of security incidents
 * @access Private (Requires Auth Token)
 */
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, severity } = req.query;
    const isClient = req.user?.role === 'Client';
    const userId = req.user?.id;

    let sql = 'SELECT * FROM incidents WHERE 1=1';
    const params: any[] = [];

    if (isClient) {
      sql += ' AND (user_id = ? OR user_id IS NULL)';
      params.push(userId);
    }
    if (status && typeof status === 'string') {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (severity && typeof severity === 'string') {
      sql += ' AND severity = ?';
      params.push(severity);
    }

    sql += ' ORDER BY timestamp DESC';

    const rows = queryObjects(sql, params);
    const incidents = rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      severity: r.severity,
      status: r.status,
      sourceIp: r.source_ip,
      targetIp: r.target_ip,
      threatScore: r.threat_score,
      description: r.description,
      timestamp: r.timestamp,
      mitigationStatus: r.mitigation_status
    }));

    res.json({ incidents, count: incidents.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch incidents' });
  }
});

// Get Single Incident by ID (Protected & Ownership Checked)
router.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const cleanId = String(id);
    const rows = queryObjects('SELECT * FROM incidents WHERE id = ?', [cleanId]);

    if (!rows.length) {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }

    const r = rows[0];
    const isClient = req.user?.role === 'Client';

    if (isClient && r.user_id && r.user_id !== req.user?.id) {
      res.status(403).json({ error: 'Access denied to target incident record' });
      return;
    }

    const incident = {
      id: r.id,
      userId: r.user_id,
      title: r.title,
      severity: r.severity,
      status: r.status,
      sourceIp: r.source_ip,
      targetIp: r.target_ip,
      threatScore: r.threat_score,
      description: r.description,
      timestamp: r.timestamp,
      mitigationStatus: r.mitigation_status
    };

    res.json({ incident });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch incident' });
  }
});

// Create New Incident (Protected & Ownership Saved)
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const parseResult = createIncidentSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid incident payload';
    res.status(400).json({ error: errorMsg });
    return;
  }

  try {
    const { title, severity, status, sourceIp, targetIp, threatScore, description, mitigationStatus } = parseResult.data;

    const db = getDb();
    const id = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();
    const finalStatus = status || 'Active';
    const finalScore = typeof threatScore === 'number' ? threatScore : 75;
    const finalMitigation = mitigationStatus || 'Investigating';
    const uId = req.user?.id || null;

    const stmt = db.prepare(`
      INSERT INTO incidents (id, user_id, title, severity, status, source_ip, target_ip, threat_score, description, timestamp, mitigation_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([id, uId, title, severity, finalStatus, sourceIp, targetIp, finalScore, description || '', timestamp, finalMitigation]);
    stmt.free();
    saveDb();

    const incident = {
      id,
      userId: uId,
      title,
      severity,
      status: finalStatus,
      sourceIp,
      targetIp,
      threatScore: finalScore,
      description: description || '',
      timestamp,
      mitigationStatus: finalMitigation
    };

    res.status(201).json({ message: 'Incident created successfully', incident });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create incident' });
  }
});

// Update Incident Status & Mitigation (Protected & Ownership Checked)
router.patch('/:id/status', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const parseResult = patchStatusSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid update payload' });
    return;
  }

  try {
    const { id } = req.params;
    const cleanId = String(id);
    const { status, mitigationStatus } = parseResult.data;

    const existing = queryObjects('SELECT * FROM incidents WHERE id = ?', [cleanId]);
    if (!existing.length) {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }

    const current = existing[0];
    const isClient = req.user?.role === 'Client';

    if (isClient && current.user_id && current.user_id !== req.user?.id) {
      res.status(403).json({ error: 'Access denied to target incident record' });
      return;
    }

    const newStatus = status || current.status;
    const newMitigation = mitigationStatus || current.mitigation_status;

    const db = getDb();
    const stmt = db.prepare('UPDATE incidents SET status = ?, mitigation_status = ? WHERE id = ?');
    stmt.run([newStatus, newMitigation, cleanId]);
    stmt.free();
    saveDb();

    res.json({
      message: 'Incident updated successfully',
      incident: {
        id: cleanId,
        userId: current.user_id,
        title: current.title,
        severity: current.severity,
        status: newStatus,
        sourceIp: current.source_ip,
        targetIp: current.target_ip,
        threatScore: current.threat_score,
        description: current.description,
        timestamp: current.timestamp,
        mitigationStatus: newMitigation
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update incident status' });
  }
});

export default router;
