import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { User } from '../../src/types/index.js';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getOrCreateUser, getUserByUid } from '../../src/db/users.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'kingplay_jwt_secret_royal_enfield_411_adventure';

export interface AuthRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export async function authenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    // 1. Try Firebase Auth ID token verification first
    const decodedFirebase = await adminAuth.verifyIdToken(token).catch(() => null);
    if (decodedFirebase) {
      let dbUser = await getUserByUid(decodedFirebase.uid).catch(() => null);
      if (!dbUser) {
        dbUser = await getOrCreateUser(
          decodedFirebase.uid,
          decodedFirebase.email || '',
          decodedFirebase.name || '',
          decodedFirebase.picture || ''
        );
      }
      if (dbUser) {
        req.user = {
          id: dbUser.uid,
          name: dbUser.name || dbUser.email.split('@')[0],
          username: dbUser.username || dbUser.email.split('@')[0],
          email: dbUser.email,
          role: (dbUser.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
          avatarUrl: dbUser.avatarUrl || undefined,
          bio: dbUser.bio || undefined,
          createdAt: dbUser.createdAt ? dbUser.createdAt.toISOString() : new Date().toISOString(),
        };
        return next();
      }
    }

    // 2. Fallback to local JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = db.users.find(u => u.id === decoded.id);
    if (user) {
      const { passwordHash, ...safeUser } = user;
      req.user = safeUser as User;
    }
  } catch (err) {
    // Invalid token, continue as unauthenticated
  }
  next();
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'You must be logged in to perform this action' },
    });
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Admin privileges required' },
    });
  }
  next();
}
