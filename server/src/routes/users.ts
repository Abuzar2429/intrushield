import { Router, Response } from 'express';
import { z } from 'zod';
import { getDb, saveDb } from '../db/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';

const router = Router();

const updateRoleSchema = z.object({
  role: z.enum(['Administrator', 'Analyst', 'Auditor']),
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
    const users = queryObjects('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC');
    const formatted = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.created_at,
    }));

    res.json({ users: formatted, count: formatted.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch user list.' });
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
    res.status(400).json({ error: 'Invalid role specification. Allowed values: Administrator, Analyst, Auditor' });
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
