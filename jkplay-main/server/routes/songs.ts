import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { AuthRequest, requireAuth } from '../services/auth.js';
import { extractYouTubeVideoId, fetchYouTubeVideoMetadata } from '../services/youtube.js';
import { Song } from '../../src/types/index.js';

const router = Router();

// GET all songs
router.get('/', (req, res) => {
  const { genre, search } = req.query;
  let songs = [...db.songs];

  if (genre && typeof genre === 'string' && genre !== 'All') {
    songs = songs.filter(s => s.genre?.toLowerCase() === genre.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    songs = songs.filter(s => 
      s.title.toLowerCase().includes(q) || 
      s.artist.toLowerCase().includes(q) ||
      s.channelName.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    data: { songs },
  });
});

// GET single song
router.get('/:id', (req, res) => {
  const song = db.songs.find(s => s.id === req.params.id);
  if (!song) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Song not found' },
    });
  }
  res.json({ success: true, data: { song } });
});

// POST validate YouTube URL and get preview metadata
router.post('/validate-youtube', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_URL', message: 'Please enter a YouTube video URL' },
      });
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_YOUTUBE_URL',
          message: 'Could not extract a valid YouTube video ID from the provided link.',
        },
      });
    }

    // Check if song already exists in database
    const existing = db.songs.find(s => s.youtubeVideoId === videoId);

    // Fetch fresh metadata
    const metadata = await fetchYouTubeVideoMetadata(videoId);

    res.json({
      success: true,
      data: {
        ...metadata,
        alreadyInLibrary: Boolean(existing),
        existingSongId: existing?.id,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: err.message || 'Failed to fetch YouTube metadata' },
    });
  }
});

// POST add YouTube song
router.post('/add-youtube', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { url, customTitle, customArtist, genre, playlistId } = req.body;
    const userId = req.user!.id;
    const username = req.user!.username;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_URL', message: 'YouTube URL is required' },
      });
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_YOUTUBE_URL', message: 'Invalid YouTube URL or Video ID' },
      });
    }

    // 1. Check if song already exists in catalog
    let song = db.songs.find(s => s.youtubeVideoId === videoId);

    if (!song) {
      // 2. Fetch metadata from YouTube
      const meta = await fetchYouTubeVideoMetadata(videoId);

      song = {
        id: `sng_${uuidv4().substring(0, 8)}`,
        youtubeVideoId: videoId,
        youtubeUrl: meta.youtubeUrl,
        title: customTitle?.trim() || meta.title,
        artist: customArtist?.trim() || meta.artist,
        channelName: meta.channelName,
        thumbnailUrl: meta.thumbnailUrl,
        duration: meta.duration || 210,
        description: meta.description,
        genre: genre || 'Music',
        isAvailable: meta.isAvailable,
        createdBy: userId,
        addedByUsername: username,
        createdAt: new Date().toISOString(),
        playsCount: 0,
      };

      db.addSong(song);
    }

    // 3. If a playlist was selected, add the song to the playlist
    let addedToPlaylist = false;
    if (playlistId) {
      const playlist = db.playlists.find(p => p.id === playlistId);
      if (playlist) {
        // Prevent duplicate songs inside the same playlist
        const alreadyInPlaylist = playlist.songs.some(ps => ps.songId === song!.id);
        if (!alreadyInPlaylist) {
          playlist.songs.push({
            id: `ps_${uuidv4().substring(0, 8)}`,
            songId: song.id,
            addedAt: new Date().toISOString(),
            order: playlist.songs.length,
          });
          db.updatePlaylist(playlist.id, { songs: playlist.songs });
          addedToPlaylist = true;
        }
      }
    }

    res.status(201).json({
      success: true,
      data: { song, addedToPlaylist },
      message: 'Song added successfully to KingPlay',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message || 'Failed to add song' },
    });
  }
});

// Like / unlike song
router.post('/:id/like', requireAuth, (req: AuthRequest, res: Response) => {
  const songId = req.params.id;
  const userId = req.user!.id;

  const song = db.songs.find(s => s.id === songId);
  if (!song) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Song not found' } });
  }

  const liked = db.toggleLike(userId, songId);
  res.json({
    success: true,
    data: { liked, songId },
    message: liked ? 'Added to Liked Songs' : 'Removed from Liked Songs',
  });
});

// GET liked songs
router.get('/user/liked', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const userLikes = db.likes.filter(l => l.userId === userId);
  const songIds = new Set(userLikes.map(l => l.songId));
  const songs = db.songs.filter(s => songIds.has(s.id));

  res.json({
    success: true,
    data: { songs },
  });
});

// GET recently added by user
router.get('/user/added', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const songs = db.songs.filter(s => s.createdBy === userId);

  res.json({
    success: true,
    data: { songs },
  });
});

// Record play history
router.post('/history/record', requireAuth, (req: AuthRequest, res: Response) => {
  const { songId } = req.body;
  const userId = req.user!.id;

  if (!songId) {
    return res.status(400).json({ success: false, error: { code: 'MISSING_SONG_ID' } });
  }

  db.recordHistory(userId, songId);
  res.json({ success: true });
});

// GET play history
router.get('/user/history', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const historyItems = db.history.filter(h => h.userId === userId).slice(0, 50);

  const songsMap = new Map(db.songs.map(s => [s.id, s]));
  const historyWithSongs = historyItems
    .map(h => ({
      ...h,
      song: songsMap.get(h.songId),
    }))
    .filter(h => h.song !== undefined);

  res.json({
    success: true,
    data: { history: historyWithSongs },
  });
});

export default router;
