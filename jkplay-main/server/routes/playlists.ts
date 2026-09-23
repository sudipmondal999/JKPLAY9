import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { AuthRequest, requireAuth } from '../services/auth.js';
import { extractYouTubePlaylistId, fetchYouTubePlaylistTracks } from '../services/youtube.js';
import { Playlist } from '../../src/types/index.js';

const router = Router();

// GET all public or user playlists
router.get('/', (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?.id;
  const playlists = db.playlists.filter(
    p => p.visibility === 'public' || (currentUserId && p.ownerId === currentUserId)
  );

  res.json({
    success: true,
    data: { playlists },
  });
});

// GET single playlist with populated songs
router.get('/:id', (req: AuthRequest, res: Response) => {
  const playlist = db.playlists.find(p => p.id === req.params.id);
  if (!playlist) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Playlist not found' } });
  }

  // Check visibility permissions
  if (playlist.visibility === 'private' && playlist.ownerId !== req.user?.id) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Private playlist' } });
  }

  const songMap = new Map(db.songs.map(s => [s.id, s]));
  const populatedSongs = playlist.songs
    .map(ps => ({
      ...ps,
      song: songMap.get(ps.songId),
    }))
    .filter(ps => ps.song !== undefined);

  res.json({
    success: true,
    data: {
      playlist: {
        ...playlist,
        populatedSongs,
      },
    },
  });
});

// POST create playlist
router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { name, description, visibility, coverImage } = req.body;
    const user = req.user!;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Playlist name is required' },
      });
    }

    const newPlaylist: Playlist = {
      id: `ply_${uuidv4().substring(0, 8)}`,
      name: name.trim(),
      description: description?.trim() || '',
      coverImage: coverImage || '',
      ownerId: user.id,
      ownerName: user.name,
      visibility: visibility === 'private' ? 'private' : 'public',
      songs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addPlaylist(newPlaylist);

    res.status(201).json({
      success: true,
      data: { playlist: newPlaylist },
      message: 'Playlist created successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// PATCH update playlist
router.patch('/:id', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const playlist = db.playlists.find(p => p.id === req.params.id);
    if (!playlist) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Playlist not found' } });
    }

    if (playlist.ownerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Permission denied' } });
    }

    const { name, description, visibility, coverImage } = req.body;
    const updated = db.updatePlaylist(playlist.id, {
      ...(name ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
      ...(visibility ? { visibility } : {}),
      ...(coverImage ? { coverImage } : {}),
    });

    res.json({
      success: true,
      data: { playlist: updated },
      message: 'Playlist updated successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// DELETE playlist
router.delete('/:id', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const playlist = db.playlists.find(p => p.id === req.params.id);
    if (!playlist) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Playlist not found' } });
    }

    if (playlist.ownerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Permission denied' } });
    }

    db.deletePlaylist(playlist.id);
    res.json({ success: true, message: 'Playlist deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// POST add song to playlist
router.post('/:id/songs', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const playlist = db.playlists.find(p => p.id === req.params.id);
    if (!playlist) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Playlist not found' } });
    }

    if (playlist.ownerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Permission denied' } });
    }

    const { songId } = req.body;
    const song = db.songs.find(s => s.id === songId);
    if (!song) {
      return res.status(404).json({ success: false, error: { code: 'SONG_NOT_FOUND', message: 'Song not found' } });
    }

    // Check duplicate
    if (playlist.songs.some(ps => ps.songId === songId)) {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_SONG', message: 'This song is already in the playlist' },
      });
    }

    playlist.songs.push({
      id: `ps_${uuidv4().substring(0, 8)}`,
      songId,
      addedAt: new Date().toISOString(),
      order: playlist.songs.length,
    });

    if (!playlist.coverImage) {
      playlist.coverImage = song.thumbnailUrl;
    }

    db.updatePlaylist(playlist.id, { songs: playlist.songs, coverImage: playlist.coverImage });

    res.status(201).json({
      success: true,
      data: { playlist },
      message: 'Song added to playlist',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// DELETE remove song from playlist
router.delete('/:id/songs/:songId', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const playlist = db.playlists.find(p => p.id === req.params.id);
    if (!playlist) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Playlist not found' } });
    }

    if (playlist.ownerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Permission denied' } });
    }

    const songId = req.params.songId;
    playlist.songs = playlist.songs.filter(ps => ps.songId !== songId);
    db.updatePlaylist(playlist.id, { songs: playlist.songs });

    res.json({
      success: true,
      data: { playlist },
      message: 'Song removed from playlist',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// PUT reorder songs in playlist
router.put('/:id/reorder', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const playlist = db.playlists.find(p => p.id === req.params.id);
    if (!playlist) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    }

    if (playlist.ownerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
    }

    const { orderedSongIds } = req.body;
    if (!Array.isArray(orderedSongIds)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_ORDER' } });
    }

    const existingMap = new Map(playlist.songs.map(ps => [ps.songId, ps]));
    const newSongs: typeof playlist.songs = [];

    orderedSongIds.forEach((sId, index) => {
      const item = existingMap.get(sId);
      if (item) {
        newSongs.push({ ...item, order: index });
      }
    });

    db.updatePlaylist(playlist.id, { songs: newSongs });

    res.json({ success: true, data: { playlist } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// POST import YouTube playlist
router.post('/import-youtube', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { url, title, description } = req.body;
    const user = req.user!;

    if (!url) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_URL', message: 'YouTube playlist URL or ID is required' } });
    }

    const playlistId = extractYouTubePlaylistId(url);
    if (!playlistId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PLAYLIST_URL', message: 'Could not extract a valid YouTube playlist ID' },
      });
    }

    // Fetch tracks
    const importedTracks = await fetchYouTubePlaylistTracks(playlistId);

    // Save newly imported tracks to catalog
    const addedSongIds: string[] = [];
    for (const track of importedTracks) {
      if (!track.youtubeVideoId) continue;
      let existing = db.songs.find(s => s.youtubeVideoId === track.youtubeVideoId);
      if (!existing) {
        existing = db.addSong({
          id: `sng_yt_${uuidv4().substring(0, 8)}`,
          youtubeVideoId: track.youtubeVideoId,
          youtubeUrl: track.youtubeUrl || `https://www.youtube.com/watch?v=${track.youtubeVideoId}`,
          title: track.title || 'YouTube Track',
          artist: track.artist || 'YouTube Artist',
          channelName: track.channelName || 'YouTube',
          thumbnailUrl: track.thumbnailUrl || `https://img.youtube.com/vi/${track.youtubeVideoId}/hqdefault.jpg`,
          duration: track.duration || 210,
          genre: 'Imported',
          isAvailable: true,
          createdBy: user.id,
          addedByUsername: user.username,
          createdAt: new Date().toISOString(),
          playsCount: 0,
        });
      }
      if (!addedSongIds.includes(existing.id)) {
        addedSongIds.push(existing.id);
      }
    }

    const newPlaylist: Playlist = {
      id: `ply_${uuidv4().substring(0, 8)}`,
      name: title?.trim() || `YouTube Playlist (${playlistId.substring(0, 8)})`,
      description: description?.trim() || `Imported from YouTube playlist ${playlistId}`,
      coverImage: importedTracks[0]?.thumbnailUrl || '',
      ownerId: user.id,
      ownerName: user.name,
      visibility: 'public',
      isImported: true,
      youtubePlaylistId: playlistId,
      songs: addedSongIds.map((sId, idx) => ({
        id: `ps_${uuidv4().substring(0, 8)}`,
        songId: sId,
        addedAt: new Date().toISOString(),
        order: idx,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addPlaylist(newPlaylist);

    res.status(201).json({
      success: true,
      data: { playlist: newPlaylist, importedCount: addedSongIds.length },
      message: `Successfully imported playlist with ${addedSongIds.length} tracks`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
