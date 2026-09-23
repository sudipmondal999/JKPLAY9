import React, { useState, useEffect } from 'react';
import { Playlist, Song } from '../types/index.js';
import { useAuthStore } from '../stores/authStore.js';
import { usePlayerStore } from '../stores/playerStore.js';
import { formatTime } from '../utils/formatTime.js';
import { SongRow } from '../components/music/SongRow.js';
import {
  Play,
  Shuffle,
  Trash2,
  Lock,
  Globe,
  Plus,
  ArrowLeft,
  Music,
  Share2,
  Check,
} from 'lucide-react';

interface PlaylistDetailViewProps {
  playlistId: string;
  onBack: () => void;
  onOpenAddSong: () => void;
  onPlaylistDeleted: (playlistId: string) => void;
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({
  playlistId,
  onBack,
  onOpenAddSong,
  onPlaylistDeleted,
}) => {
  const { user, token } = useAuthStore();
  const { playTrack, toggleShuffle } = usePlayerStore();

  const [playlist, setPlaylist] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchPlaylist = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/playlists/${playlistId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && data.data?.playlist) {
        setPlaylist(data.data.playlist);
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId, token]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
        Loading playlist details...
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm">
        <p>Playlist not found.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  const songs: Song[] = playlist.populatedSongs?.map((ps: any) => ps.song) || [];
  const totalDuration = songs.reduce((acc, s) => acc + (s?.duration || 0), 0);
  const isOwner = user && (user.id === playlist.ownerId || user.role === 'admin');

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playTrack(songs[0], songs);
    }
  };

  const handleShufflePlay = () => {
    if (songs.length > 0) {
      toggleShuffle();
      const randomIdx = Math.floor(Math.random() * songs.length);
      playTrack(songs[randomIdx], songs);
    }
  };

  const handleRemoveSong = async (songId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/playlists/${playlist.id}/songs/${songId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchPlaylist();
      }
    } catch (err) {}
  };

  const handleDeletePlaylist = async () => {
    if (!token) return;
    if (!window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) return;

    try {
      const res = await fetch(`/api/playlists/${playlist.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onPlaylistDeleted(playlist.id);
        onBack();
      }
    } catch (err) {}
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Playlists</span>
      </button>

      {/* Playlist Hero */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end p-6 rounded-3xl bg-gradient-to-t from-purple-950/20 via-white/[0.02] to-transparent border border-white/[0.06]">
        {/* Cover Art */}
        <div className="w-44 h-44 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 shadow-2xl shadow-purple-950/40">
          {playlist.coverImage ? (
            <img
              src={playlist.coverImage}
              alt={playlist.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900 to-indigo-950 flex items-center justify-center text-purple-300 font-display font-bold text-4xl">
              KP
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">
            {playlist.visibility === 'private' ? (
              <span className="flex items-center gap-1 text-amber-400">
                <Lock className="w-3.5 h-3.5" /> Private Playlist
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <Globe className="w-3.5 h-3.5" /> Public Playlist
              </span>
            )}
            {playlist.isImported && (
              <span className="text-red-400">• YouTube Import</span>
            )}
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight truncate">
            {playlist.name}
          </h1>

          {playlist.description && (
            <p className="text-xs sm:text-sm text-slate-300 mt-2 line-clamp-2 max-w-2xl leading-relaxed">
              {playlist.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-3">
            <span className="font-medium text-white">{playlist.ownerName}</span>
            <span>•</span>
            <span>{songs.length} tracks</span>
            <span>•</span>
            <span className="font-mono">{formatTime(totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayAll}
            disabled={songs.length === 0}
            className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-purple-950/40 hover:scale-105 transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Play</span>
          </button>

          <button
            onClick={handleShufflePlay}
            disabled={songs.length === 0}
            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            title="Shuffle Play"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopyLink}
            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Share Playlist"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              <button
                onClick={onOpenAddSong}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Song</span>
              </button>

              <button
                onClick={handleDeletePlaylist}
                className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete Playlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tracks Table */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-white/[0.06]">
          <div className="flex items-center gap-3.5 flex-1">
            <span className="w-6 text-center">#</span>
            <span className="ml-10">Title</span>
          </div>
          <span className="hidden md:block w-40 px-2">Channel</span>
          <span className="w-12 text-right">Time</span>
        </div>

        {songs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-3">
            <Music className="w-8 h-8 mx-auto opacity-30" />
            <p>This playlist is empty.</p>
            {isOwner && (
              <button
                onClick={onOpenAddSong}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold"
              >
                Add Songs via YouTube
              </button>
            )}
          </div>
        ) : (
          songs.map((song, idx) => (
            <div key={song.id} className="relative group">
              <SongRow song={song} index={idx} allSongs={songs} />
              {isOwner && (
                <button
                  onClick={() => handleRemoveSong(song.id)}
                  className="absolute right-14 top-3 opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                  title="Remove from playlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
