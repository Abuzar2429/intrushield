import { Router, Response } from 'express';
import { z } from 'zod';
import { getDb, saveDb } from '../db/database';
import { hashPassword, verifyPassword, generateUUID } from '../utils/cryptoUtils';
import { generateToken, requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// Zod Validation Schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.string().optional(),
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

// Login Endpoint
router.post('/login', (req: AuthenticatedRequest, res: Response) => {
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
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

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
        createdAt: userRow.created_at
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

// Register Endpoint
router.post('/register', (req: AuthenticatedRequest, res: Response) => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid input';
    res.status(400).json({ error: errorMsg });
    return;
  }

  const { email, password, name, role } = parseResult.data;

  try {
    const cleanEmail = email.toLowerCase().trim();
    const existing = queryObjects('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    
    if (existing.length) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const userId = generateUUID();
    const passwordHash = hashPassword(password);
    const userRole = role || 'Analyst';
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

// Reset Password Endpoint
router.post('/reset-password', (req: AuthenticatedRequest, res: Response) => {
  const parseResult = resetPasswordSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid input';
    res.status(400).json({ error: errorMsg });
    return;
  }

  const { email, newPassword } = parseResult.data;

  try {
    const cleanEmail = email.toLowerCase().trim();
    const existing = queryObjects('SELECT id FROM users WHERE email = ?', [cleanEmail]);

    if (!existing.length) {
      res.status(404).json({ error: 'Account with specified email not found.' });
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
