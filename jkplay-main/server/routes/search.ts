import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

router.get('/', (req, res) => {
  const q = ((req.query.q as string) || '').trim().toLowerCase();
  const type = ((req.query.type as string) || 'all').toLowerCase();

  if (!q) {
    return res.json({
      success: true,
      data: {
        songs: [],
        playlists: [],
        users: [],
        stories: [],
      },
    });
  }

  let songs: any[] = [];
  let playlists: any[] = [];
  let users: any[] = [];
  let stories: any[] = [];

  if (type === 'all' || type === 'songs') {
    songs = db.songs.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.channelName.toLowerCase().includes(q) ||
        (s.genre && s.genre.toLowerCase().includes(q))
    ).slice(0, 20);
  }

  if (type === 'all' || type === 'playlists') {
    playlists = db.playlists.filter(
      p =>
        p.visibility === 'public' &&
        (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    ).slice(0, 10);
  }

  if (type === 'all' || type === 'users') {
    users = db.users
      .filter(u => u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q))
      .map(({ passwordHash, ...safeUser }) => safeUser)
      .slice(0, 10);
  }

  if (type === 'all' || type === 'stories') {
    stories = db.stories.filter(
      s =>
        s.published &&
        (s.title.toLowerCase().includes(q) ||
          s.excerpt.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.tags.some(t => t.toLowerCase().includes(q)))
    ).slice(0, 10);
  }

  res.json({
    success: true,
    data: {
      query: q,
      type,
      songs,
      playlists,
      users,
      stories,
    },
  });
});

export default router;
