export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Song {
  id: string;
  youtubeVideoId: string;
  youtubeUrl: string;
  title: string;
  artist: string;
  channelName: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  description?: string;
  genre?: string;
  isAvailable: boolean;
  createdBy?: string;
  addedByUsername?: string;
  createdAt: string;
  updatedAt?: string;
  playsCount?: number;
}

export interface PlaylistSongItem {
  id: string;
  songId: string;
  addedAt: string;
  order: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  ownerId: string;
  ownerName: string;
  visibility: 'public' | 'private';
  songs: PlaylistSongItem[];
  createdAt: string;
  updatedAt: string;
  isImported?: boolean;
  youtubePlaylistId?: string;
}

export interface PlayHistoryItem {
  id: string;
  userId: string;
  songId: string;
  song?: Song;
  playedAt: string;
}

export interface LikeItem {
  id: string;
  userId: string;
  songId: string;
  createdAt: string;
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: string;
  authorName: string;
  category: string;
  tags: string[];
  readingTime: string;
  published: boolean;
  likesCount: number;
  likedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JamParticipant {
  socketId: string;
  userId?: string;
  username: string;
  avatarUrl?: string;
  isHost: boolean;
  joinedAt: string;
}

export interface JamRoom {
  roomCode: string;
  name: string;
  hostId: string;
  hostUsername: string;
  currentTrack?: Song | null;
  isPlaying: boolean;
  position: number; // in seconds
  lastUpdatedTimestamp: number;
  queue: Song[];
  participants: JamParticipant[];
  everyoneCanControl: boolean;
  createdAt: string;
}

export type ActiveTab = 
  | 'home'
  | 'discover'
  | 'music'
  | 'library'
  | 'stories'
  | 'jam'
  | 'search'
  | 'profile'
  | 'playlist'
  | 'playlist-detail'
  | 'settings'
  | 'admin';

export interface SleepTimerState {
  enabled: boolean;
  mode: 'duration' | 'end_of_song';
  endTime: number | null; // Absolute epoch timestamp ms (Date.now() + durationMs)
  durationMinutes: number | null; // The chosen minutes (e.g. 5, 10, 15, 30, 45, 60, custom)
  fadeOut: boolean; // Whether gradual 30s volume fade out is enabled
  originalVolume: number | null; // Volume level saved before fade-out started
  isSleeping: boolean; // True when timer finishes and playback has been stopped
}
