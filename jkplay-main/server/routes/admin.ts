import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { AuthRequest, requireAdmin } from '../services/auth.js';

const router = Router();

// Protect all admin endpoints
router.use(requireAdmin);

// GET admin dashboard stats
router.get('/stats', (req: AuthRequest, res: Response) => {
  const totalUsers = db.users.length;
  const totalSongs = db.songs.length;
  const totalPlaylists = db.playlists.length;
  const totalStories = db.stories.length;
  const activeJamRooms = db.jamRooms.length;

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalSongs,
        totalPlaylists,
        totalStories,
        activeJamRooms,
      },
    },
  });
});

// GET users list
router.get('/users', (req: AuthRequest, res: Response) => {
  const users = db.users.map(({ passwordHash, ...u }) => u);
  res.json({ success: true, data: { users } });
});

// PATCH change user role / disable
router.patch('/users/:id', (req: AuthRequest, res: Response) => {
  const { role, bio } = req.body;
  const updated = db.updateUser(req.params.id, {
    ...(role ? { role } : {}),
    ...(bio ? { bio } : {}),
  });

  if (!updated) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  }

  const { passwordHash, ...safeUser } = updated;
  res.json({ success: true, data: { user: safeUser }, message: 'User updated' });
});

// DELETE song from catalog
router.delete('/songs/:id', (req: AuthRequest, res: Response) => {
  db.deleteSong(req.params.id);
  res.json({ success: true, message: 'Song removed from catalog' });
});

// DELETE playlist
router.delete('/playlists/:id', (req: AuthRequest, res: Response) => {
  db.deletePlaylist(req.params.id);
  res.json({ success: true, message: 'Playlist deleted' });
});

// Moderate / toggle story published state
router.patch('/stories/:id/moderate', (req: AuthRequest, res: Response) => {
  const { published } = req.body;
  const updated = db.updateStory(req.params.id, { published: Boolean(published) });
  if (!updated) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  }
  res.json({ success: true, data: { story: updated } });
});

export default router;
