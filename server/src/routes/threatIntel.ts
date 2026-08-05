import { Router, Response } from 'express';
import { z } from 'zod';
import { getDb, saveDb } from '../db/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';

const router = Router();

const addIocSchema = z.object({
  ioc: z.string().min(1, 'IOC value is required'),
  type: z.enum(['IPv4', 'IPv6', 'Domain', 'MD5', 'SHA256', 'URL']),
  threatActor: z.string().optional(),
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Critical']),
  confidence: z.number().min(0).max(1).optional(),
  description: z.string().optional(),
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
 * @route GET /api/threat-intel
 * @desc Fetch threat intelligence indicators of compromise (IOCs)
 * @access Private (Requires Auth Token)
 */
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { query, type, riskLevel } = req.query;
    let sql = 'SELECT * FROM threat_intel WHERE 1=1';
    const params: any[] = [];

    if (type && typeof type === 'string') {
      sql += ' AND type = ?';
      params.push(type);
    }
    if (riskLevel && typeof riskLevel === 'string') {
      sql += ' AND risk_level = ?';
      params.push(riskLevel);
    }
    if (query && typeof query === 'string') {
      sql += ' AND (ioc LIKE ? OR threat_actor LIKE ? OR description LIKE ?)';
      const term = `%${query}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY last_seen DESC';

    const rows = queryObjects(sql, params);
    const iocs = rows.map(r => ({
      id: r.id,
      ioc: r.ioc,
      type: r.type,
      threatActor: r.threat_actor,
      riskLevel: r.risk_level,
      confidence: r.confidence,
      status: r.status,
      lastSeen: r.last_seen,
      description: r.description
    }));

    res.json({ iocs, count: iocs.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch threat intel records' });
  }
});

// Add New Threat Intel IOC (Protected)
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const parseResult = addIocSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid IOC input payload';
    res.status(400).json({ error: errorMsg });
    return;
  }

  try {
    const { ioc, type, threatActor, riskLevel, confidence, description } = parseResult.data;

    // Check existing
    const existing = queryObjects('SELECT id FROM threat_intel WHERE ioc = ?', [ioc.trim()]);
    if (existing.length) {
      res.status(409).json({ error: `Threat IOC '${ioc.trim()}' already registered.` });
      return;
    }

    const id = `TH-${Math.floor(100 + Math.random() * 900)}`;
    const lastSeen = new Date().toISOString();
    const finalActor = threatActor || 'Unknown / Unattributed';
    const finalConf = typeof confidence === 'number' ? confidence : 0.85;

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO threat_intel (id, ioc, type, threat_actor, risk_level, confidence, status, last_seen, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([id, ioc.trim(), type, finalActor, riskLevel, finalConf, 'Active', lastSeen, description || '']);
    stmt.free();
    saveDb();

    const record = {
      id,
      ioc: ioc.trim(),
      type,
      threatActor: finalActor,
      riskLevel,
      confidence: finalConf,
      status: 'Active',
      lastSeen,
      description: description || ''
    };

    res.status(201).json({ message: 'Threat IOC registered successfully', ioc: record });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add threat intel IOC' });
  }
});

// Remove Threat Intel IOC (Protected & Administrator RBAC Enforced)
router.delete('/:id', requireAuth, requireRole('Administrator'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const cleanId = String(id);
    const existing = queryObjects('SELECT id FROM threat_intel WHERE id = ?', [cleanId]);

    if (!existing.length) {
      res.status(404).json({ error: 'Threat IOC record not found' });
      return;
    }

    const db = getDb();
    const stmt = db.prepare('DELETE FROM threat_intel WHERE id = ?');
    stmt.run([cleanId]);
    stmt.free();
    saveDb();

    res.json({ message: 'Threat IOC record deleted successfully', id: cleanId });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete threat intel record' });
  }
});

export default router;
