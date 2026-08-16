import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { hashPassword, generateUUID } from '../utils/cryptoUtils';


const dbFilePath = process.env.DATABASE_PATH || path.join(__dirname, '../../intrushield.sqlite');
const dbDir = path.dirname(dbFilePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db: SqlJsDatabase;

export function getDb(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized yet. Call initDatabase() first.');
  }
  return db;
}

export function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFilePath, buffer);
  }
}

export async function initDatabase() {
  console.log('[DB] Initializing SQLite database via WebAssembly (sql.js)...');

  const SQL = await initSqlJs();

  if (fs.existsSync(dbFilePath)) {
    const filebuffer = fs.readFileSync(dbFilePath);
    db = new SQL.Database(filebuffer);
    console.log('[DB] Loaded existing SQLite database file from disk.');
  } else {
    db = new SQL.Database();
    console.log('[DB] Created new SQLite database in memory.');
  }

  // WAL / PRAGMA configurations
  try {
    db.run('PRAGMA foreign_keys = ON;');
  } catch (_e) {
    // Ignore if unsupported in WASM build
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      google_id TEXT,
      auth_provider TEXT NOT NULL DEFAULT 'local',
      picture TEXT,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Client',
      last_login TEXT,
      last_activity TEXT,
      created_at TEXT NOT NULL
    );
  `);

  try { db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);'); } catch (_e) {}

  db.run(`
    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL,
      source_ip TEXT NOT NULL,
      target_ip TEXT NOT NULL,
      threat_score INTEGER NOT NULL,
      description TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      mitigation_status TEXT NOT NULL DEFAULT 'Pending'
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS packets (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      source_ip TEXT NOT NULL,
      source_port INTEGER NOT NULL,
      destination_ip TEXT NOT NULL,
      destination_port INTEGER NOT NULL,
      protocol TEXT NOT NULL,
      packet_size INTEGER NOT NULL,
      risk_level TEXT NOT NULL,
      risk_score INTEGER NOT NULL,
      predicted_attack_type TEXT NOT NULL,
      status TEXT NOT NULL,
      payload_sample TEXT NOT NULL,
      ttl INTEGER NOT NULL,
      flow_duration_ms REAL NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS threat_intel (
      id TEXT PRIMARY KEY,
      ioc TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      threat_actor TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      confidence REAL NOT NULL,
      status TEXT NOT NULL,
      last_seen TEXT NOT NULL,
      description TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pcap_scans (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      file_name TEXT NOT NULL,
      file_size_bytes INTEGER NOT NULL,
      total_packets INTEGER NOT NULL,
      flow_count INTEGER NOT NULL,
      analysis_duration_seconds REAL NOT NULL,
      attack_probability REAL NOT NULL,
      classified_threat TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      predicted_confidence REAL NOT NULL,
      extracted_features_json TEXT NOT NULL,
      top_features_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      email TEXT,
      action TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      details_json TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Safe ALTER TABLE column migrations for legacy SQLite disk files
  try { db.run('ALTER TABLE users ADD COLUMN last_login TEXT;'); } catch (_e) {}
  try { db.run('ALTER TABLE users ADD COLUMN last_activity TEXT;'); } catch (_e) {}
  try { db.run('ALTER TABLE pcap_scans ADD COLUMN user_id TEXT;'); } catch (_e) {}
  try { db.run('ALTER TABLE incidents ADD COLUMN user_id TEXT;'); } catch (_e) {}
  try { db.run('ALTER TABLE users ADD COLUMN google_id TEXT;'); } catch (_e) {}
  try { db.run("ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local';"); } catch (_e) {}
  try { db.run('ALTER TABLE users ADD COLUMN picture TEXT;'); } catch (_e) {}

  // Migrate legacy users table to make password_hash nullable
  try {
    const tableInfo = db.exec("PRAGMA table_info(users);")[0];
    if (tableInfo && tableInfo.values) {
      const pwdCol = tableInfo.values.find((col: any) => col[1] === 'password_hash');
      if (pwdCol && pwdCol[3] === 1) { // notnull constraint active
        db.run(`
          CREATE TABLE users_migration_temp (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            google_id TEXT,
            auth_provider TEXT NOT NULL DEFAULT 'local',
            picture TEXT,
            name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'Client',
            last_login TEXT,
            last_activity TEXT,
            created_at TEXT NOT NULL
          );
        `);
        db.run(`
          INSERT INTO users_migration_temp (id, email, password_hash, google_id, auth_provider, picture, name, role, last_login, last_activity, created_at)
          SELECT id, email, password_hash, google_id, auth_provider, picture, name, role, last_login, last_activity, created_at FROM users;
        `);
        db.run(`DROP TABLE users;`);
        db.run(`ALTER TABLE users_migration_temp RENAME TO users;`);
        db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);`);
      }
    }
  } catch (_e) {}

  seedDefaultData();
  saveDb();
}

function seedDefaultData() {
  // Check user count
  const userResult = db.exec('SELECT COUNT(*) as count FROM users');
  const userCount = userResult[0]?.values[0][0] as number || 0;

  if (userCount === 0) {
    console.log('[DB] Seeding default admin user using native crypto.scrypt...');
    const adminHash = hashPassword('Admin@12345');
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run([generateUUID(), 'admin@intrushield.io', adminHash, 'SOC Lead Analyst', 'Administrator', new Date().toISOString()]);
    stmt.free();
  }


  // Check incident count
  const incidentResult = db.exec('SELECT COUNT(*) as count FROM incidents');
  const incidentCount = incidentResult[0]?.values[0][0] as number || 0;

  if (incidentCount === 0) {
    console.log('[DB] Seeding initial incidents...');
    const stmt = db.prepare(`
      INSERT INTO incidents (id, title, severity, status, source_ip, target_ip, threat_score, description, timestamp, mitigation_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      'INC-2026-8801',
      'Volumetric SYN Flood Attack on Port 443',
      'Critical',
      'Active',
      '185.220.101.5',
      '10.0.4.12',
      98,
      'High density SYN packets detected with abnormal asymmetric flow duration exceeding baseline by 450%.',
      new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      'Investigating'
    ]);

    stmt.run([
      'INC-2026-8794',
      'SSH Brute-Force Reconnaissance',
      'High',
      'Investigating',
      '45.142.214.8',
      '10.0.4.5',
      79,
      'Multiple failed SSH authentication attempts across consecutive port scans within 30 seconds.',
      new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      'Quarantine Target Host'
    ]);

    stmt.run([
      'INC-2026-8712',
      'DNS Tunneling Anomaly Detected',
      'Medium',
      'Resolved',
      '194.26.29.11',
      '10.0.4.88',
      54,
      'High frequency encoded TXT record requests consistent with command and control communication.',
      new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      'Resolved - IP Blocked'
    ]);

    stmt.free();
  }

  // Check threat intel count
  const threatResult = db.exec('SELECT COUNT(*) as count FROM threat_intel');
  const threatCount = threatResult[0]?.values[0][0] as number || 0;

  if (threatCount === 0) {
    console.log('[DB] Seeding threat intelligence IOCs...');
    const stmt = db.prepare(`
      INSERT INTO threat_intel (id, ioc, type, threat_actor, risk_level, confidence, status, last_seen, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      'TH-101',
      '185.220.101.5',
      'IPv4',
      'APT-29 (Cozy Bear)',
      'Critical',
      0.96,
      'Active',
      new Date().toISOString(),
      'Known Tor exit node participating in automated SYN flood botnets.'
    ]);

    stmt.run([
      'TH-102',
      'malicious-cnc-node.xyz',
      'Domain',
      'Lazarus Group',
      'High',
      0.89,
      'Active',
      new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      'Command & Control server associated with HTTP payload exfiltration.'
    ]);

    stmt.run([
      'TH-103',
      '45.142.214.8',
      'IPv4',
      'FIN7 Cybercrime Group',
      'High',
      0.91,
      'Active',
      new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      'Automated scanner probing enterprise SSH endpoints.'
    ]);

    stmt.free();
  }
}
