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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Express Middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(auditLogger);


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
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      service: 'IntruShield NIDS Core Engine',
      error: err.message
    });
  }
});

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket live packet telemetry stream
setupLiveStreamWebSocket(server);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
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

