import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { JamRoom, JamParticipant, Song } from '../types/index.js';
import { useAuthStore } from './authStore.js';
import { usePlayerStore } from './playerStore.js';

export interface ChatMessage {
  id: string;
  sender: string;
  avatarUrl?: string;
  text: string;
  timestamp: string;
  isHost?: boolean;
  isSystem?: boolean;
}

interface JamState {
  socket: Socket | null;
  room: JamRoom | null;
  isInJam: boolean;
  isHost: boolean;
  chatMessages: ChatMessage[];
  error: string | null;
  isConnecting: boolean;

  // Actions
  connectSocket: () => void;
  createRoom: (name: string, everyoneCanControl: boolean) => Promise<string | null>;
  joinRoom: (roomCode: string) => Promise<boolean>;
  leaveRoom: () => void;
  sendPlay: (position: number) => void;
  sendPause: (position: number) => void;
  sendSeek: (position: number) => void;
  sendLoadTrack: (track: Song) => void;
  sendAddToQueue: (track: Song) => void;
  sendChatMessage: (text: string) => void;
}

export const useJamStore = create<JamState>((set, get) => ({
  socket: null,
  room: null,
  isInJam: false,
  isHost: false,
  chatMessages: [],
  error: null,
  isConnecting: false,

  connectSocket: () => {
    if (get().socket) return;

    const socket = io(window.location.origin, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      // connected
    });

    socket.on('jam:init', (data: { room: JamRoom }) => {
      const currentUser = useAuthStore.getState().user;
      const isHost = currentUser ? data.room.hostId === currentUser.id : false;
      set({ room: data.room, isInJam: true, isHost, isConnecting: false });

      // If room has a current track, sync player
      if (data.room.currentTrack) {
        usePlayerStore.getState().playTrack(data.room.currentTrack);
        if (data.room.position > 0) {
          usePlayerStore.getState().seekTo(data.room.position);
        }
        usePlayerStore.getState().setPlaying(data.room.isPlaying);
      }
    });

    socket.on('jam:participants_update', (data: { participants: JamParticipant[] }) => {
      set((state) => (state.room ? { room: { ...state.room, participants: data.participants } } : {}));
    });

    socket.on('jam:participant_joined', (data: { participant: JamParticipant }) => {
      const msg: ChatMessage = {
        id: `sys_${Date.now()}`,
        sender: 'System',
        text: `${data.participant.username} joined the Jam`,
        timestamp: new Date().toISOString(),
        isSystem: true,
      };
      set((state) => ({ chatMessages: [...state.chatMessages, msg] }));
    });

    socket.on('jam:participant_left', (data: { username: string }) => {
      const msg: ChatMessage = {
        id: `sys_${Date.now()}`,
        sender: 'System',
        text: `${data.username} left the Jam`,
        timestamp: new Date().toISOString(),
        isSystem: true,
      };
      set((state) => ({ chatMessages: [...state.chatMessages, msg] }));
    });

    socket.on('jam:sync_play', (data: { position: number; timestamp: number }) => {
      // Calculate transit latency offset
      const transitDelay = Math.max(0, (Date.now() - data.timestamp) / 1000);
      const correctedPos = data.position + transitDelay;

      usePlayerStore.getState().seekTo(correctedPos);
      usePlayerStore.getState().setPlaying(true);
      set((state) => (state.room ? { room: { ...state.room, isPlaying: true, position: correctedPos } } : {}));
    });

    socket.on('jam:sync_pause', (data: { position: number }) => {
      usePlayerStore.getState().seekTo(data.position);
      usePlayerStore.getState().setPlaying(false);
      set((state) => (state.room ? { room: { ...state.room, isPlaying: false, position: data.position } } : {}));
    });

    socket.on('jam:sync_seek', (data: { position: number }) => {
      usePlayerStore.getState().seekTo(data.position);
      set((state) => (state.room ? { room: { ...state.room, position: data.position } } : {}));
    });

    socket.on('jam:sync_track', (data: { track: Song; position: number; isPlaying: boolean }) => {
      usePlayerStore.getState().playTrack(data.track);
      usePlayerStore.getState().seekTo(data.position);
      usePlayerStore.getState().setPlaying(data.isPlaying);
      set((state) => (state.room ? { room: { ...state.room, currentTrack: data.track, isPlaying: data.isPlaying } } : {}));
    });

    socket.on('jam:sync_queue', (data: { queue: Song[] }) => {
      set((state) => (state.room ? { room: { ...state.room, queue: data.queue } } : {}));
    });

    socket.on('jam:chat_broadcast', (msg: ChatMessage) => {
      set((state) => ({ chatMessages: [...state.chatMessages, msg] }));
    });

    socket.on('jam:error', (err: { message: string }) => {
      set({ error: err.message });
    });

    set({ socket });
  },

  createRoom: async (name, everyoneCanControl) => {
    const user = useAuthStore.getState().user;
    const token = useAuthStore.getState().token;
    if (!user || !token) return null;

    get().connectSocket();
    set({ isConnecting: true, error: null });

    try {
      const res = await fetch('/api/jam/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, everyoneCanControl }),
      });
      const data = await res.json();
      if (data.success && data.data?.room) {
        const room: JamRoom = data.data.room;
        get().socket?.emit('jam:join', {
          roomCode: room.roomCode,
          user: { id: user.id, username: user.username, avatarUrl: user.avatarUrl },
        });
        set({ room, isInJam: true, isHost: true, isConnecting: false });
        return room.roomCode;
      }
      set({ isConnecting: false, error: data.error?.message || 'Failed to create room' });
      return null;
    } catch (err: any) {
      set({ isConnecting: false, error: err.message });
      return null;
    }
  },

  joinRoom: async (roomCode) => {
    const user = useAuthStore.getState().user;
    const token = useAuthStore.getState().token;
    if (!user || !token) return false;

    get().connectSocket();
    set({ isConnecting: true, error: null });

    try {
      const res = await fetch('/api/jam/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomCode: roomCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (data.success && data.data?.room) {
        const room: JamRoom = data.data.room;
        get().socket?.emit('jam:join', {
          roomCode: room.roomCode,
          user: { id: user.id, username: user.username, avatarUrl: user.avatarUrl },
        });
        set({
          room,
          isInJam: true,
          isHost: room.hostId === user.id,
          isConnecting: false,
        });
        return true;
      }
      set({ isConnecting: false, error: data.error?.message || 'Room not found' });
      return false;
    } catch (err: any) {
      set({ isConnecting: false, error: err.message });
      return false;
    }
  },

  leaveRoom: () => {
    const { socket, room } = get();
    if (socket && room) {
      socket.emit('jam:leave');
    }
    set({ room: null, isInJam: false, isHost: false, chatMessages: [] });
  },

  sendPlay: (position) => {
    get().socket?.emit('jam:play', { position });
  },

  sendPause: (position) => {
    get().socket?.emit('jam:pause', { position });
  },

  sendSeek: (position) => {
    get().socket?.emit('jam:seek', { position });
  },

  sendLoadTrack: (track) => {
    get().socket?.emit('jam:load_track', { track });
  },

  sendAddToQueue: (track) => {
    get().socket?.emit('jam:add_to_queue', { track });
  },

  sendChatMessage: (text) => {
    get().socket?.emit('jam:chat_send', { text });
  },
}));
