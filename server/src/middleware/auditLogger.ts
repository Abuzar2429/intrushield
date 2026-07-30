import { Request, Response, NextFunction } from 'express';

export interface AuditLogEntry {
  timestamp: string;
  method: string;
  url: string;
  ip: string;
  user?: string;
  statusCode?: number;
  durationMs?: number;
}

export function auditLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const log: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
      statusCode: res.statusCode,
      durationMs: duration
    };

    console.log(`[AUDIT] ${log.timestamp} | ${log.method} ${log.url} -> ${log.statusCode} (${log.durationMs}ms)`);
  });

  next();
}
