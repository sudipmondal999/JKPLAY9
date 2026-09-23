import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { AuthRequest, requireAuth } from '../services/auth.js';
import { JamRoom } from '../../src/types/index.js';

const router = Router();

function generateRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'KP-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST create a Jam room
router.post('/create', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { name, everyoneCanControl } = req.body;

    let roomCode = generateRoomCode();
    while (db.getJamRoom(roomCode)) {
      roomCode = generateRoomCode();
    }

    const defaultTrack = db.songs[0] || null;

    const newRoom: JamRoom = {
      roomCode,
      name: name?.trim() || `${user.name}'s Jam Session`,
      hostId: user.id,
      hostUsername: user.username,
      currentTrack: defaultTrack,
      isPlaying: false,
      position: 0,
      lastUpdatedTimestamp: Date.now(),
      queue: db.songs.slice(1, 4),
      participants: [
        {
          socketId: '',
          userId: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
          isHost: true,
          joinedAt: new Date().toISOString(),
        },
      ],
      everyoneCanControl: Boolean(everyoneCanControl),
      createdAt: new Date().toISOString(),
    };

    db.saveJamRoom(newRoom);

    res.status(201).json({
      success: true,
      data: { room: newRoom },
      message: 'Jam room created',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// POST join Jam room
router.post('/join', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { roomCode } = req.body;
    const user = req.user!;

    if (!roomCode) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_CODE', message: 'Room code is required' } });
    }

    const room = db.getJamRoom(roomCode.trim().toUpperCase());
    if (!room) {
      return res.status(404).json({
        success: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Jam room with this code does not exist' },
      });
    }

    // Add or update participant
    const existingIdx = room.participants.findIndex(p => p.userId === user.id);
    if (existingIdx === -1) {
      room.participants.push({
        socketId: '',
        userId: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        isHost: room.hostId === user.id,
        joinedAt: new Date().toISOString(),
      });
      db.saveJamRoom(room);
    }

    res.json({
      success: true,
      data: { room },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// GET Jam room details
router.get('/:roomCode', (req, res) => {
  const room = db.getJamRoom(req.params.roomCode);
  if (!room) {
    return res.status(404).json({ success: false, error: { code: 'ROOM_NOT_FOUND', message: 'Jam room not found' } });
  }
  res.json({ success: true, data: { room } });
});

export default router;
