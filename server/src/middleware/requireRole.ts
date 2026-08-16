import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

/**
 * Middleware to enforce Role-Based Access Control (RBAC).
 * Restricts endpoint access to users possessing specified roles.
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const userRole = req.user.role || 'Client';
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}.`
      });
      return;
    }

    next();
  };
}
