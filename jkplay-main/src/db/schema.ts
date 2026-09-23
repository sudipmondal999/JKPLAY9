import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// 1. Users table (synced with Firebase Authentication UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  username: text('username'),
  role: text('role').default('user'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Songs table
export const songs = pgTable('songs', {
  id: text('id').primaryKey(),
  youtubeVideoId: text('youtube_video_id').notNull(),
  youtubeUrl: text('youtube_url').notNull(),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  channelName: text('channel_name'),
  thumbnailUrl: text('thumbnail_url').notNull(),
  duration: integer('duration').notNull(),
  genre: text('genre'),
  isAvailable: boolean('is_available').default(true),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Playlists table
export const playlists = pgTable('playlists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  coverUrl: text('cover_url'),
  creatorId: text('creator_id').notNull(),
  creatorName: text('creator_name').notNull(),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Playlist Songs join table
export const playlistSongs = pgTable('playlist_songs', {
  id: serial('id').primaryKey(),
  playlistId: text('playlist_id').notNull().references(() => playlists.id, { onDelete: 'cascade' }),
  songId: text('song_id').notNull().references(() => songs.id, { onDelete: 'cascade' }),
  addedAt: timestamp('added_at').defaultNow(),
});

// 5. Liked songs table
export const likes = pgTable('likes', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  songId: text('song_id').notNull().references(() => songs.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Playback history table
export const history = pgTable('history', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  songId: text('song_id').notNull().references(() => songs.id, { onDelete: 'cascade' }),
  playedAt: timestamp('played_at').defaultNow(),
});

// 7. Stories table
export const stories = pgTable('stories', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  userAvatar: text('user_avatar'),
  songId: text('song_id'),
  songTitle: text('song_title'),
  songArtist: text('song_artist'),
  songThumbnail: text('song_thumbnail'),
  mediaUrl: text('media_url'),
  caption: text('caption'),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  playlists: many(playlists),
  likes: many(likes),
  history: many(history),
  stories: many(stories),
}));

export const playlistsRelations = relations(playlists, ({ many }) => ({
  songs: many(playlistSongs),
}));

export const playlistSongsRelations = relations(playlistSongs, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistSongs.playlistId],
    references: [playlists.id],
  }),
  song: one(songs, {
    fields: [playlistSongs.songId],
    references: [songs.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  song: one(songs, {
    fields: [likes.songId],
    references: [songs.id],
  }),
}));

export const historyRelations = relations(history, ({ one }) => ({
  song: one(songs, {
    fields: [history.songId],
    references: [songs.id],
  }),
}));
