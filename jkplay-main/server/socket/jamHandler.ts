import { Server as SocketIOServer, Socket } from 'socket.io';
import { db } from '../db/index.js';
import { Song, JamParticipant } from '../../src/types/index.js';

export function setupJamSocketHandlers(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    let currentRoomCode: string | null = null;
    let currentUser: JamParticipant | null = null;

    // Join room
    socket.on('jam:join', (data: { roomCode: string; user: { id: string; username: string; avatarUrl?: string } }) => {
      const { roomCode, user } = data;
      if (!roomCode || !user) return;

      const cleanCode = roomCode.trim().toUpperCase();
      const room = db.getJamRoom(cleanCode);
      if (!room) {
        socket.emit('jam:error', { message: 'Jam room not found' });
        return;
      }

      currentRoomCode = cleanCode;
      socket.join(cleanCode);

      const isHost = room.hostId === user.id;
      currentUser = {
        socketId: socket.id,
        userId: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        isHost,
        joinedAt: new Date().toISOString(),
      };

      // Add to room participants if not present with same socket
      const existingIdx = room.participants.findIndex(p => p.userId === user.id);
      if (existingIdx !== -1) {
        room.participants[existingIdx].socketId = socket.id;
      } else {
        room.participants.push(currentUser);
      }
      db.saveJamRoom(room);

      // Send initial state to the joining user
      socket.emit('jam:init', { room });

      // Broadcast to other participants
      socket.to(cleanCode).emit('jam:participant_joined', { participant: currentUser });
      io.to(cleanCode).emit('jam:participants_update', { participants: room.participants });
    });

    // Playback control: PLAY
    socket.on('jam:play', (data: { position: number }) => {
      if (!currentRoomCode) return;
      const room = db.getJamRoom(currentRoomCode);
      if (!room) return;

      // Check permission
      if (!room.everyoneCanControl && currentUser && !currentUser.isHost) {
        return socket.emit('jam:error', { message: 'Only the host can control playback' });
      }

      room.isPlaying = true;
      room.position = data.position ?? room.position;
      room.lastUpdatedTimestamp = Date.now();
      db.saveJamRoom(room);

      io.to(currentRoomCode).emit('jam:sync_play', {
        type: 'PLAY',
        position: room.position,
        timestamp: room.lastUpdatedTimestamp,
        trackId: room.currentTrack?.id,
      });
    });

    // Playback control: PAUSE
    socket.on('jam:pause', (data: { position: number }) => {
      if (!currentRoomCode) return;
      const room = db.getJamRoom(currentRoomCode);
      if (!room) return;

      if (!room.everyoneCanControl && currentUser && !currentUser.isHost) {
        return socket.emit('jam:error', { message: 'Only the host can control playback' });
      }

      room.isPlaying = false;
      room.position = data.position ?? room.position;
      room.lastUpdatedTimestamp = Date.now();
      db.saveJamRoom(room);

      io.to(currentRoomCode).emit('jam:sync_pause', {
        type: 'PAUSE',
        position: room.position,
        timestamp: room.lastUpdatedTimestamp,
      });
    });

    // Playback control: SEEK
    socket.on('jam:seek', (data: { position: number }) => {
      if (!currentRoomCode) return;
      const room = db.getJamRoom(currentRoomCode);
      if (!room) return;

      if (!room.everyoneCanControl && currentUser && !currentUser.isHost) {
        return socket.emit('jam:error', { message: 'Only the host can seek' });
      }

      room.position = data.position;
      room.lastUpdatedTimestamp = Date.now();
      db.saveJamRoom(room);

      io.to(currentRoomCode).emit('jam:sync_seek', {
        type: 'SEEK',
        position: room.position,
        timestamp: room.lastUpdatedTimestamp,
      });
    });

    // Playback control: LOAD_TRACK
    socket.on('jam:load_track', (data: { track: Song }) => {
      if (!currentRoomCode) return;
      const room = db.getJamRoom(currentRoomCode);
      if (!room) return;

      if (!room.everyoneCanControl && currentUser && !currentUser.isHost) {
        return socket.emit('jam:error', { message: 'Only the host can change tracks' });
      }

      room.currentTrack = data.track;
      room.position = 0;
      room.isPlaying = true;
      room.lastUpdatedTimestamp = Date.now();
      db.saveJamRoom(room);

      io.to(currentRoomCode).emit('jam:sync_track', {
        type: 'LOAD_TRACK',
        track: room.currentTrack,
        position: 0,
        isPlaying: true,
        timestamp: room.lastUpdatedTimestamp,
      });
    });

    // Update Queue
    socket.on('jam:update_queue', (data: { queue: Song[] }) => {
      if (!currentRoomCode) return;
      const room = db.getJamRoom(currentRoomCode);
      if (!room) return;

      room.queue = data.queue;
      db.saveJamRoom(room);

      io.to(currentRoomCode).emit('jam:sync_queue', { queue: room.queue });
    });

    // Add song to jam queue (participants can also request/add songs!)
    socket.on('jam:add_to_queue', (data: { track: Song }) => {
      if (!currentRoomCode) return;
      const room = db.getJamRoom(currentRoomCode);
      if (!room) return;

      room.queue.push(data.track);
      db.saveJamRoom(room);

      io.to(currentRoomCode).emit('jam:sync_queue', { queue: room.queue });
      io.to(currentRoomCode).emit('jam:chat_broadcast', {
        id: `msg_${Date.now()}`,
        sender: 'System',
        text: `${currentUser?.username || 'Someone'} queued "${data.track.title}"`,
        timestamp: new Date().toISOString(),
        isSystem: true,
      });
    });

    // Real-time Chat in Jam Room
    socket.on('jam:chat_send', (data: { text: string }) => {
      if (!currentRoomCode || !currentUser || !data.text?.trim()) return;

      io.to(currentRoomCode).emit('jam:chat_broadcast', {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        sender: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        text: data.text.trim(),
        timestamp: new Date().toISOString(),
        isHost: currentUser.isHost,
      });
    });

    // Leave / Disconnect
    const handleLeave = () => {
      if (!currentRoomCode) return;
      const room = db.getJamRoom(currentRoomCode);
      if (!room) return;

      room.participants = room.participants.filter(p => p.socketId !== socket.id);
      db.saveJamRoom(room);

      io.to(currentRoomCode).emit('jam:participants_update', { participants: room.participants });
      if (currentUser) {
        socket.to(currentRoomCode).emit('jam:participant_left', { username: currentUser.username });
      }
    };

    socket.on('jam:leave', handleLeave);
    socket.on('disconnect', handleLeave);
  });
}
