import { Router, Response } from 'express';
import { z } from 'zod';
import { getDb, saveDb } from '../db/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';

const router = Router();

const updateRoleSchema = z.object({
  role: z.enum(['Administrator', 'Client', 'Analyst', 'Auditor']),
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
 * @openapi
 * /api/users:
 *   get:
 *     summary: Fetch list of security team users
 *     tags: [Users Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of registered SOC users and total count
 *       401:
 *         description: Authentication token missing or invalid
 *       403:
 *         description: Administrator privileges required
 */
router.get('/', requireAuth, requireRole('Administrator'), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const users = queryObjects('SELECT id, email, name, role, last_login, last_activity, created_at FROM users ORDER BY created_at DESC');
    const scanCounts = queryObjects('SELECT user_id, COUNT(*) as count FROM pcap_scans WHERE user_id IS NOT NULL GROUP BY user_id');
    const scanMap: Record<string, number> = {};
    scanCounts.forEach(s => {
      scanMap[s.user_id] = s.count;
    });

    const formatted = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      lastLogin: u.last_login || null,
      lastActivity: u.last_activity || null,
      scanCount: scanMap[u.id] || 0,
      createdAt: u.created_at,
    }));

    res.json({ users: formatted, count: formatted.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch user list.' });
  }
});

/**
 * GET /api/users/audit-logs
 * Fetch persistent system security audit logs. Restricted to Administrators.
 */
router.get('/audit-logs', requireAuth, requireRole('Administrator'), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = queryObjects('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
    const formatted = logs.map(l => ({
      id: l.id,
      userId: l.user_id,
      email: l.email,
      action: l.action,
      endpoint: l.endpoint,
      method: l.method,
      ipAddress: l.ip_address,
      statusCode: l.status_code,
      details: l.details_json ? JSON.parse(l.details_json) : null,
      createdAt: l.created_at,
    }));

    res.json({ logs: formatted, count: formatted.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch audit logs.' });
  }
});

/**
 * PATCH /api/users/:id/role
 * Update user role. Restricted to Administrators.
 */
router.patch('/:id/role', requireAuth, requireRole('Administrator'), (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const parseResult = updateRoleSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid role specification. Allowed values: Administrator, Client, Analyst, Auditor' });
    return;
  }

  try {
    const existing = queryObjects('SELECT id FROM users WHERE id = ?', [id]);
    if (!existing.length) {
      res.status(404).json({ error: 'Target user account not found.' });
      return;
    }

    const newRole = parseResult.data.role;
    const db = getDb();
    const stmt = db.prepare('UPDATE users SET role = ? WHERE id = ?');
    stmt.run([newRole, id]);
    stmt.free();
    saveDb();

    res.json({
      message: `User role updated successfully to ${newRole}`,
      userId: id,
      newRole,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update user role.' });
  }
});

export default router;
