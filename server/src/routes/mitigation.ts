import { Router, Response } from 'express';
import { z } from 'zod';
import { getDb, saveDb } from '../db/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';

const router = Router();

const blockIpSchema = z.object({
  ip: z.string().ip({ message: 'Valid IPv4 or IPv6 target IP address is required' }),
  reason: z.string().optional(),
  actionType: z.enum(['BGP_FLOWSPEC', 'IPTABLES_DROP', 'QUARANTINE_VLAN']).optional(),
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

// Ensure active_mitigations table exists on module import
function initMitigationTable() {
  try {
    const db = getDb();
    db.run(`
      CREATE TABLE IF NOT EXISTS active_mitigations (
        id TEXT PRIMARY KEY,
        ip_address TEXT UNIQUE NOT NULL,
        action_type TEXT NOT NULL,
        rule_syntax TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  } catch (err) {
    // Ignore if table init fails before DB ready
  }
}

// Get All Active Firewall & BGP Mitigation Rules (Protected)
router.get('/active-rules', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    initMitigationTable();
    const rows = queryObjects('SELECT * FROM active_mitigations ORDER BY created_at DESC');
    const rules = rows.map(r => ({
      id: r.id,
      ipAddress: r.ip_address,
      actionType: r.action_type,
      ruleSyntax: r.rule_syntax,
      reason: r.reason,
      status: r.status,
      createdAt: r.created_at,
    }));

    res.json({ rules, count: rules.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch active mitigation rules' });
  }
});

// Trigger Automated IP Mitigation Block Action (Protected & RBAC Enforced)
router.post('/block-ip', requireAuth, requireRole('Administrator', 'Analyst'), (req: AuthenticatedRequest, res: Response) => {
  const parseResult = blockIpSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid mitigation payload';
    res.status(400).json({ error: errorMsg });
    return;
  }

  try {
    initMitigationTable();
    const { ip, reason, actionType } = parseResult.data;
    const cleanIp = ip.trim();
    const type = actionType || 'BGP_FLOWSPEC';
    const ruleId = `RULE-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = new Date().toISOString();
    const ruleReason = reason || 'Automated high-confidence threat score anomaly mitigation.';

    let ruleSyntax = `iptables -A INPUT -s ${cleanIp} -j DROP`;
    if (type === 'BGP_FLOWSPEC') {
      ruleSyntax = `flow route { match { source ${cleanIp}/32; } then { rate-limit 0; } }`;
    } else if (type === 'QUARANTINE_VLAN') {
      ruleSyntax = `set interfaces ge-0/0/1 unit 0 family inet filter input quarantine-${cleanIp}`;
    }

    const existing = queryObjects('SELECT id FROM active_mitigations WHERE ip_address = ?', [cleanIp]);
    if (existing.length) {
      res.json({
        message: `IP ${cleanIp} is already blocked on security gateway.`,
        rule: {
          id: existing[0].id,
          ipAddress: cleanIp,
          actionType: type,
          ruleSyntax,
          reason: ruleReason,
          status: 'Active (Enforced)',
          createdAt,
        },
      });
      return;
    }

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO active_mitigations (id, ip_address, action_type, rule_syntax, reason, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([ruleId, cleanIp, type, ruleSyntax, ruleReason, 'Active (Enforced)', createdAt]);
    stmt.free();

    // Update matching incident status if any
    const updateStmt = db.prepare(`
      UPDATE incidents
      SET status = 'Resolved', mitigation_status = ?
      WHERE source_ip = ?
    `);
    updateStmt.run([`Mitigated (${type})`, cleanIp]);
    updateStmt.free();

    saveDb();

    res.status(201).json({
      message: `Automated mitigation rule enforced for IP ${cleanIp}`,
      rule: {
        id: ruleId,
        ipAddress: cleanIp,
        actionType: type,
        ruleSyntax,
        reason: ruleReason,
        status: 'Active (Enforced)',
        createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to enforce mitigation rule' });
  }
});

export default router;
