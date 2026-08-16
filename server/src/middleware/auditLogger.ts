import { Request, Response, NextFunction } from 'express';
import { getDb, saveDb } from '../db/database';
import { generateUUID } from '../utils/cryptoUtils';
import { AuthenticatedRequest } from './authMiddleware';

export interface AuditLogEntry {
  timestamp: string;
  method: string;
  url: string;
  ip: string;
  userId?: string;
  email?: string;
  statusCode?: number;
  durationMs?: number;
}

/**
 * Persists a security audit event to the SQLite database.
 * Redacts any sensitive keys (passwords, tokens) before logging.
 */
export function logSecurityEvent(params: {
  userId?: string;
  email?: string;
  action: string;
  endpoint: string;
  method: string;
  ipAddress: string;
  statusCode: number;
  details?: Record<string, any>;
}) {
  try {
    const db = getDb();
    const id = generateUUID();
    const createdAt = new Date().toISOString();

    // Sanitize details to avoid logging passwords or tokens
    let sanitizedDetails: Record<string, any> | undefined = undefined;
    if (params.details) {
      sanitizedDetails = { ...params.details };
      delete sanitizedDetails.password;
      delete sanitizedDetails.newPassword;
      delete sanitizedDetails.token;
      delete sanitizedDetails.authorization;
    }

    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, user_id, email, action, endpoint, method, ip_address, status_code, details_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      id,
      params.userId || null,
      params.email || null,
      params.action,
      params.endpoint,
      params.method,
      params.ipAddress,
      params.statusCode,
      sanitizedDetails ? JSON.stringify(sanitizedDetails) : null,
      createdAt,
    ]);

    stmt.free();
    saveDb();
  } catch (err) {
    console.error('[AUDIT LOG ERROR] Failed to record audit log:', err);
  }
}

export function auditLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const email = authReq.user?.email;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const url = req.originalUrl || req.url;

    // Update user's last_activity timestamp if authenticated
    if (userId) {
      try {
        const db = getDb();
        const updateStmt = db.prepare('UPDATE users SET last_activity = ? WHERE id = ?');
        updateStmt.run([new Date().toISOString(), userId]);
        updateStmt.free();
      } catch (_err) {
        // Ignore DB write errors on shutdown
      }
    }

    console.log(`[AUDIT] ${new Date().toISOString()} | ${req.method} ${url} -> ${res.statusCode} (${duration}ms) [User: ${email || 'Anonymous'}]`);

    // Record audit event for state-changing requests, auth endpoints, or security violations
    const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    const isSecurityViolation = [401, 403].includes(res.statusCode);
    const isAuthEndpoint = url.includes('/api/auth');

    if (isStateChanging || isSecurityViolation || isAuthEndpoint) {
      let action = `${req.method}_${url.split('?')[0].replace('/api/', '').replace(/\//g, '_').toUpperCase()}`;
      if (res.statusCode === 403) action = 'UNAUTHORIZED_ACCESS_ATTEMPT';
      else if (res.statusCode === 401) action = 'UNAUTHENTICATED_ACCESS_ATTEMPT';

      logSecurityEvent({
        userId,
        email,
        action,
        endpoint: url,
        method: req.method,
        ipAddress: ip,
        statusCode: res.statusCode,
        details: { durationMs: duration },
      });
    }
  });

  next();
}
