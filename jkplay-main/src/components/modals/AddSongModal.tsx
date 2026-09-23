import React, { useState, useEffect } from 'react';
import { Playlist, Song } from '../../types/index.js';
import { useAuthStore } from '../../stores/authStore.js';
import { usePlayerStore } from '../../stores/playerStore.js';
import { X, Youtube, Check, AlertCircle, Loader2, Music, ListPlus } from 'lucide-react';
import { formatTime } from '../../utils/formatTime.js';

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPlaylists: Playlist[];
  onSongAdded: (song: Song) => void;
}

export const AddSongModal: React.FC<AddSongModalProps> = ({
  isOpen,
  onClose,
  userPlaylists,
  onSongAdded,
}) => {
  const { user, token } = useAuthStore();
  const { playTrack } = usePlayerStore();

  const [url, setUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [preview, setPreview] = useState<{
    youtubeVideoId: string;
    title: string;
    artist: string;
    channelName: string;
    thumbnailUrl: string;
    duration: number;
    isAvailable: boolean;
    alreadyInLibrary: boolean;
  } | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customArtist, setCustomArtist] = useState('');
  const [genre, setGenre] = useState('Lo-Fi / Synth');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Validate YouTube link as user types or pastes
  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      setPreview(null);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsValidating(true);
      setError(null);
      try {
        const res = await fetch('/api/songs/validate-youtube', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: trimmed }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setPreview(data.data);
          setCustomTitle(data.data.title);
          setCustomArtist(data.data.artist);
          setError(null);
        } else {
          setError(data.error?.message || 'Could not find YouTube video.');
          setPreview(null);
        }
      } catch (err: any) {
        setError('Error validating link.');
        setPreview(null);
      } finally {
        setIsValidating(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [url]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Please log in to add songs to KingPlay');
      return;
    }

    if (!url.trim()) {
      setError('Please enter a YouTube video URL');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/songs/add-youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: url.trim(),
          customTitle,
          customArtist,
          genre,
          playlistId: selectedPlaylistId || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.song) {
        setSuccessMsg('Song successfully added to KingPlay!');
        onSongAdded(data.data.song);
        playTrack(data.data.song);
        setTimeout(() => {
          onClose();
          setUrl('');
          setPreview(null);
          setSuccessMsg(null);
        }, 1200);
      } else {
        setError(data.error?.message || 'Failed to add song');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0F0F1A] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Add Song from YouTube</h3>
              <p className="text-xs text-slate-400">Stream tracks via official YouTube player</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              YouTube URL or Video ID
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                autoFocus
              />
              {isValidating && (
                <div className="absolute right-3 top-3">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                </div>
              )}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Supports standard watch URLs, youtu.be, shorts, and embed links.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Metadata Preview Card */}
          {preview && (
            <div className="p-3.5 bg-purple-950/20 border border-purple-500/20 rounded-xl space-y-3">
              <div className="flex gap-3">
                <img
                  src={preview.thumbnailUrl}
                  alt={preview.title}
                  className="w-20 h-14 rounded-lg object-cover border border-white/10 shrink-0 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 mb-1">
                    Valid Video • {formatTime(preview.duration)}
                  </span>
                  <h4 className="text-xs font-semibold text-white truncate">{preview.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{preview.channelName}</p>
                </div>
              </div>

              {/* Editable Title & Artist */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Song Title</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 mt-0.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Artist</label>
                  <input
                    type="text"
                    value={customArtist}
                    onChange={(e) => setCustomArtist(e.target.value)}
                    className="w-full px-2.5 py-1.5 mt-0.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Genre & Optional Playlist */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Genre</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-2.5 py-1.5 mt-0.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="Lo-Fi / Synth">Lo-Fi / Synth</option>
                    <option value="Rock / Metal">Rock / Metal</option>
                    <option value="Acoustic / Indie">Acoustic / Indie</option>
                    <option value="Ambient / Trip-Hop">Ambient / Trip-Hop</option>
                    <option value="Electronic / EDM">Electronic / EDM</option>
                    <option value="Soundtrack / Adventure">Soundtrack / Adventure</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Add to Playlist</label>
                  <select
                    value={selectedPlaylistId}
                    onChange={(e) => setSelectedPlaylistId(e.target.value)}
                    className="w-full px-2.5 py-1.5 mt-0.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="">(None - Catalog Only)</option>
                    {userPlaylists.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !url.trim()}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-all shadow-lg shadow-purple-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Music className="w-3.5 h-3.5" />
                  <span>Add to KingPlay</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
