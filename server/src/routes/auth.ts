import { Router, Response } from 'express';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import { getDb, saveDb } from '../db/database';
import { hashPassword, verifyPassword, generateUUID } from '../utils/cryptoUtils';
import { generateToken, verifyToken, requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { authRateLimiter } from '../middleware/rateLimiter';
import { logSecurityEvent } from '../middleware/auditLogger';

const router = Router();

// Zod Validation Schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const googleAuthSchema = z.object({
  credential: z.string().min(1, 'Google ID token credential is required'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

// Helper to convert SQL statement result to object array
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
 * @route POST /api/auth/login
 * @desc Authenticate user credentials and return JWT bearer token
 * @access Public
 */
router.post('/login', authRateLimiter, (req: AuthenticatedRequest, res: Response) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid input';
    res.status(400).json({ error: errorMsg });
    return;
  }

  const { email, password } = parseResult.data;

  try {
    const users = queryObjects('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    
    if (!users.length) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const userRow = users[0];
    const isMatch = verifyPassword(password, userRow.password_hash);
    
    if (!isMatch) {
      logSecurityEvent({
        email: email.toLowerCase().trim(),
        action: 'USER_LOGIN_FAILED',
        endpoint: '/api/auth/login',
        method: 'POST',
        ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
        statusCode: 401,
        details: { reason: 'Invalid password' }
      });
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const nowIso = new Date().toISOString();
    const db = getDb();
    const updateStmt = db.prepare('UPDATE users SET last_login = ?, last_activity = ? WHERE id = ?');
    updateStmt.run([nowIso, nowIso, userRow.id]);
    updateStmt.free();
    saveDb();

    logSecurityEvent({
      userId: userRow.id,
      email: userRow.email,
      action: 'USER_LOGIN_SUCCESS',
      endpoint: '/api/auth/login',
      method: 'POST',
      ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
      statusCode: 200
    });

    const token = generateToken({
      id: userRow.id,
      email: userRow.email,
      role: userRow.role
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: userRow.id,
        email: userRow.email,
        name: userRow.name,
        role: userRow.role,
        lastLogin: nowIso,
        lastActivity: nowIso,
        createdAt: userRow.created_at
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

/**
 * @route POST /api/auth/google
 * @desc Authenticate using Google OAuth 2.0 / OIDC ID Token (credential)
 * @access Public
 */
router.post('/google', authRateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  const parseResult = googleAuthSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid input';
    res.status(400).json({ error: errorMsg });
    return;
  }

  const { credential } = parseResult.data;

  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      logSecurityEvent({
        action: 'GOOGLE_LOGIN_CONFIG_ERROR',
        endpoint: '/api/auth/google',
        method: 'POST',
        ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
        statusCode: 500,
        details: { reason: 'GOOGLE_CLIENT_ID environment variable missing' }
      });
      res.status(500).json({ error: 'Google authentication is not configured on the server.' });
      return;
    }

    const client = new OAuth2Client(googleClientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.email_verified) {
      logSecurityEvent({
        action: 'GOOGLE_LOGIN_FAILED',
        endpoint: '/api/auth/google',
        method: 'POST',
        ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
        statusCode: 401,
        details: { reason: 'Unverified email or invalid payload' }
      });
      res.status(401).json({ error: 'Unverified Google account or invalid token.' });
      return;
    }

    const cleanEmail = payload.email.toLowerCase().trim();
    const googleId = payload.sub;
    const name = payload.name || cleanEmail.split('@')[0];
    const picture = payload.picture || null;

    // Strict Role Mapping: Assign Administrator ONLY if email matches server ADMIN_EMAIL environment variable
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const isAdministrator = Boolean(adminEmail && cleanEmail === adminEmail);
    const targetRole = isAdministrator ? 'Administrator' : 'Client';

    const nowIso = new Date().toISOString();
    const db = getDb();

    // Check if user exists by email or google_id
    const existing = queryObjects('SELECT * FROM users WHERE email = ? OR google_id = ?', [cleanEmail, googleId]);
    let userId: string;

    if (existing.length) {
      userId = existing[0].id;
      const updateStmt = db.prepare(`
        UPDATE users
        SET google_id = ?, auth_provider = 'google', picture = ?, name = ?, role = ?, last_login = ?, last_activity = ?
        WHERE id = ?
      `);
      updateStmt.run([googleId, picture, name, targetRole, nowIso, nowIso, userId]);
      updateStmt.free();
    } else {
      userId = generateUUID();
      const insertStmt = db.prepare(`
        INSERT INTO users (id, email, password_hash, google_id, auth_provider, picture, name, role, last_login, last_activity, created_at)
        VALUES (?, ?, NULL, ?, 'google', ?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run([userId, cleanEmail, googleId, picture, name, targetRole, nowIso, nowIso, nowIso]);
      insertStmt.free();
    }

    saveDb();

    logSecurityEvent({
      userId,
      email: cleanEmail,
      action: 'GOOGLE_LOGIN_SUCCESS',
      endpoint: '/api/auth/google',
      method: 'POST',
      ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
      statusCode: 200,
      details: { role: targetRole }
    });

    const token = generateToken({
      id: userId,
      email: cleanEmail,
      role: targetRole,
    });

    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: userId,
        email: cleanEmail,
        name,
        picture,
        role: targetRole,
        lastLogin: nowIso,
        lastActivity: nowIso,
        createdAt: existing.length ? existing[0].created_at : nowIso,
      },
    });
  } catch (err: any) {
    logSecurityEvent({
      action: 'GOOGLE_LOGIN_FAILED',
      endpoint: '/api/auth/google',
      method: 'POST',
      ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
      statusCode: 401,
      details: { error: err.message }
    });
    res.status(401).json({ error: err.message || 'Google authentication failed.' });
  }
});

// Register Endpoint
router.post('/register', authRateLimiter, (req: AuthenticatedRequest, res: Response) => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid input';
    res.status(400).json({ error: errorMsg });
    return;
  }

  const { email, password, name } = parseResult.data;

  try {
    const cleanEmail = email.toLowerCase().trim();
    const existing = queryObjects('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    
    if (existing.length) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const userId = generateUUID();
    const passwordHash = hashPassword(password);
    // Enforce 'Client' role for public self-registration to prevent privilege escalation
    const userRole = 'Client';
    const createdAt = new Date().toISOString();

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run([userId, cleanEmail, passwordHash, name.trim(), userRole, createdAt]);
    stmt.free();
    saveDb();

    const token = generateToken({ id: userId, email: cleanEmail, role: userRole });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email: cleanEmail,
        name: name.trim(),
        role: userRole,
        createdAt
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

// User Profile Endpoint
router.get('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const users = queryObjects('SELECT id, email, name, role, created_at FROM users WHERE id = ?', [userId]);

    if (!users.length) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    const user = users[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch profile.' });
  }
});

// Reset Password Endpoint (Requires Authentication or Valid Password Verification)
router.post('/reset-password', authRateLimiter, (req: AuthenticatedRequest, res: Response) => {
  const parseResult = resetPasswordSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid input';
    res.status(400).json({ error: errorMsg });
    return;
  }

  const { email, newPassword } = parseResult.data;
  const currentPassword = req.body?.currentPassword;
  const authHeader = req.headers.authorization;

  try {
    const cleanEmail = email.toLowerCase().trim();
    const users = queryObjects('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    if (!users.length) {
      res.status(404).json({ error: 'Account with specified email not found.' });
      return;
    }

    const userRow = users[0];

    // Check authorization: Must either have valid Bearer token OR present matching currentPassword
    let isAuthorized = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const decoded = req.user || verifyToken(authHeader.substring(7));
      if (decoded && (decoded.email.toLowerCase() === cleanEmail || decoded.role === 'Administrator')) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && currentPassword) {
      if (verifyPassword(currentPassword, userRow.password_hash)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      res.status(401).json({
        error: 'Authentication required. Missing Bearer token or invalid current password.'
      });
      return;
    }

    const newHash = hashPassword(newPassword);
    const db = getDb();
    const stmt = db.prepare(`UPDATE users SET password_hash = ? WHERE email = ?`);
    stmt.run([newHash, cleanEmail]);
    stmt.free();
    saveDb();

    res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Password reset failed.' });
  }
});

export default router;
