import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { hashPassword, comparePassword, generateToken, AuthRequest, requireAuth } from '../services/auth.js';
import { User } from '../../src/types/index.js';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getOrCreateUser } from '../../src/db/users.ts';

const router = Router();

// Firebase Auth verification & Cloud SQL user sync endpoint
router.post('/firebase-sync', async (req, res) => {
  try {
    const { idToken, name: clientName } = req.body;
    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_TOKEN', message: 'Firebase ID token is required' },
      });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const resolvedName = decoded.name || clientName || (decoded.email ? decoded.email.split('@')[0] : '');

    let dbUser;
    try {
      dbUser = await getOrCreateUser(
        decoded.uid,
        decoded.email || '',
        resolvedName,
        decoded.picture || ''
      );
    } catch (error) {
      // Keep local development usable when PostgreSQL is not running.
      console.warn('PostgreSQL unavailable during Firebase sync; using local user store:', error);
      const existingUser = db.users.find((user) => user.email === (decoded.email || ''));
      const localUser = existingUser
        ? db.updateUser(existingUser.id, {
            name: resolvedName,
            avatarUrl: decoded.picture || existingUser.avatarUrl,
          })
        : db.addUser({
            id: decoded.uid,
            name: resolvedName,
            username: (decoded.email || `user_${decoded.uid.slice(0, 6)}`)
              .split('@')[0]
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, ''),
            email: decoded.email || `${decoded.uid}@kingplay.auth`,
            role: 'user',
            avatarUrl: decoded.picture || `https://api.dicebear.com/7.x/identicon/svg?seed=${decoded.uid}`,
            bio: 'Music explorer on KingPlay.',
            createdAt: new Date().toISOString(),
            passwordHash: '',
          });

      dbUser = {
        uid: localUser.id,
        email: localUser.email,
        name: localUser.name,
        username: localUser.username,
        role: localUser.role,
        avatarUrl: localUser.avatarUrl,
        bio: localUser.bio,
        createdAt: new Date(localUser.createdAt),
      };
    }

    const safeUser: User = {
      id: dbUser.uid,
      name: dbUser.name || resolvedName,
      username: dbUser.username || resolvedName.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      email: dbUser.email,
      role: (dbUser.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
      avatarUrl: dbUser.avatarUrl || undefined,
      bio: dbUser.bio || undefined,
      createdAt: dbUser.createdAt ? dbUser.createdAt.toISOString() : new Date().toISOString(),
    };

    // Keep server memory store in sync for playlist/history lookups
    const existingIndex = db.users.findIndex((u) => u.id === safeUser.id);
    if (existingIndex >= 0) {
      db.users[existingIndex] = { ...db.users[existingIndex], ...safeUser };
    } else {
      db.users.push({ ...safeUser, passwordHash: '' });
    }

    const sessionToken = generateToken(safeUser);

    res.json({
      success: true,
      data: {
        user: safeUser,
        token: sessionToken,
        firebaseToken: idToken,
      },
      message: 'Signed in successfully via Firebase',
    });
  } catch (err: any) {
    console.error('Firebase sync error:', err);
    res.status(401).json({
      success: false,
      error: { code: 'AUTH_FAILED', message: err.message || 'Authentication failed' },
    });
  }
});


router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'All fields are required' },
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists
    if (db.users.some(u => u.username.toLowerCase() === cleanUsername)) {
      return res.status(409).json({
        success: false,
        error: { code: 'USERNAME_TAKEN', message: 'This username is already taken' },
      });
    }

    if (db.users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_REGISTERED', message: 'An account with this email already exists' },
      });
    }

    const newUser: User & { passwordHash: string } = {
      id: `usr_${uuidv4().substring(0, 8)}`,
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      role: 'user',
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`,
      bio: 'Music explorer on KingPlay.',
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(password),
    };

    db.addUser(newUser);

    // Sync into Cloud SQL PostgreSQL database
    await getOrCreateUser(newUser.id, newUser.email, newUser.name, newUser.avatarUrl).catch((err) => {
      console.warn('PostgreSQL sync notice on register:', err);
    });

    const { passwordHash, ...safeUser } = newUser;
    const token = generateToken(safeUser);

    res.status(201).json({
      success: true,
      data: { user: safeUser, token },
      message: 'Account created successfully',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message || 'Registration failed' },
    });
  }
});

router.post('/login', (req, res) => {
  try {
    const { login, password } = req.body; // login can be email or username

    if (!login || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Username/email and password are required' },
      });
    }

    const cleanLogin = login.trim().toLowerCase();
    const user = db.users.find(
      u => u.email.toLowerCase() === cleanLogin || u.username.toLowerCase() === cleanLogin
    );

    if (!user || !comparePassword(password, user.passwordHash)) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username/email or password' },
      });
    }

    const { passwordHash, ...safeUser } = user;
    const token = generateToken(safeUser);

    res.json({
      success: true,
      data: { user: safeUser, token },
      message: 'Logged in successfully',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message || 'Login failed' },
    });
  }
});

router.get('/me', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
    });
  }
  res.json({
    success: true,
    data: { user: req.user },
  });
});

router.patch('/profile', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, bio, avatarUrl } = req.body;

    const updated = db.updateUser(userId, {
      ...(name ? { name: name.trim() } : {}),
      ...(bio !== undefined ? { bio: bio.trim() } : {}),
      ...(avatarUrl ? { avatarUrl } : {}),
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    const { passwordHash, ...safeUser } = updated;
    res.json({
      success: true,
      data: { user: safeUser },
      message: 'Profile updated successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
