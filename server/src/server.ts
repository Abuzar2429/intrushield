import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import { getDb, initDatabase, saveDb } from './db/database';

import authRouter from './routes/auth';
import incidentsRouter from './routes/incidents';
import threatIntelRouter from './routes/threatIntel';
import pcapRouter from './routes/pcap';
import mitigationRouter from './routes/mitigation';

import { auditLogger } from './middleware/auditLogger';
import { setupLiveStreamWebSocket } from './websocket/liveStream';
import { apiRateLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Express Middleware Security Hardening
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'same-origin' },
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, same-origin) or matching host
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, true); // Dev fallback
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(auditLogger);
app.use('/api', apiRateLimiter);

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/threat-intel', threatIntelRouter);
app.use('/api/pcap', pcapRouter);
app.use('/api/mitigation', mitigationRouter);


// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userRes = db.exec('SELECT COUNT(*) as count FROM users');
    const userCount = userRes[0]?.values[0][0] as number || 0;

    const incidentRes = db.exec('SELECT COUNT(*) as count FROM incidents');
    const incidentCount = incidentRes[0]?.values[0][0] as number || 0;

    const threatRes = db.exec('SELECT COUNT(*) as count FROM threat_intel');
    const threatCount = threatRes[0]?.values[0][0] as number || 0;

    res.json({
      status: 'online',
      service: 'IntruShield NIDS Core Engine',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: {
        engine: 'SQLite (WebAssembly / sql.js)',
        status: 'connected',
        usersCount: userCount,
        incidentsCount: incidentCount,
        threatIntelCount: threatCount
      }
    });
  } catch (_err: any) {
    res.status(500).json({
      status: 'error',
      service: 'IntruShield NIDS Core Engine',
      error: 'Health check failed'
    });
  }
});

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket live packet telemetry stream
setupLiveStreamWebSocket(server);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SERVER ERROR]', err);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal Server Error'
    : (err.message || 'Internal Server Error');

  res.status(status).json({ error: message });
});

// Initialize DB and start listening
async function startServer() {
  await initDatabase();

  // Auto-save DB snapshot on process termination signals
  process.on('SIGINT', () => {
    console.log('[DB] Saving snapshot before shutdown...');
    saveDb();
    process.exit(0);
  });

  server.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`  🛡️ IntruShield Backend Server Running on Port ${PORT}`);
    console.log(`  🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`===================================================`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
  });
}

export { app, server, startServer };

