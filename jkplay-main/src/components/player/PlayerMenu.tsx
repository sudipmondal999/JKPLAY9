import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../stores/playerStore.js';
import { useAuthStore } from '../../stores/authStore.js';
import { useToastStore } from '../../stores/toastStore.js';
import { Playlist, Song } from '../../types/index.js';
import { formatCountdown, formatTime } from '../../utils/formatTime.js';
import {
  ListPlus,
  Heart,
  Share2,
  Moon,
  FolderPlus,
  Check,
  ChevronRight,
  X,
  ListMusic,
} from 'lucide-react';

interface PlayerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  align?: 'left' | 'right';
  placement?: 'top' | 'bottom';
}

export const PlayerMenu: React.FC<PlayerMenuProps> = ({
  isOpen,
  onClose,
  align = 'right',
  placement = 'top',
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    currentTrack,
    likedSongIds,
    sleepTimer,
    duration,
    currentTime,
    addToQueue,
    toggleLike,
    setSleepTimerModalOpen,
  } = usePlayerStore();

  const { user, token } = useAuthStore();
  const { showToast } = useToastStore();

  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [addedPlaylistIds, setAddedPlaylistIds] = useState<Set<string>>(new Set());

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
        setShowPlaylistPicker(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Fetch playlists when user opens the playlist picker
  const handleOpenPlaylists = async () => {
    if (!token) {
      showToast({
        title: 'Sign In Required',
        message: 'Please sign in to add songs to your custom playlists.',
        type: 'warning',
      });
      return;
    }

    setShowPlaylistPicker(true);
    setIsLoadingPlaylists(true);
    try {
      const res = await fetch('/api/playlists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data?.playlists) {
        setUserPlaylists(data.data.playlists);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const handleAddToPlaylist = async (playlist: Playlist) => {
    if (!currentTrack || !token) return;

    try {
      const res = await fetch(`/api/playlists/${playlist.id}/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ songId: currentTrack.id }),
      });
      const data = await res.json();
      if (data.success) {
        setAddedPlaylistIds((prev) => new Set(prev).add(playlist.id));
        showToast({
          title: 'Added to Playlist',
          message: `"${currentTrack.title}" added to ${playlist.name}`,
          type: 'success',
        });
      } else {
        showToast({
          title: 'Already in Playlist',
          message: data.error?.message || 'Song is already in this playlist.',
          type: 'info',
        });
      }
    } catch (err) {
      showToast({
        title: 'Error',
        message: 'Failed to add song to playlist.',
        type: 'error',
      });
    }
  };

  const handleAddToQueue = () => {
    if (currentTrack) {
      addToQueue(currentTrack);
      onClose();
    }
  };

  const handleToggleLike = () => {
    if (currentTrack) {
      toggleLike(currentTrack.id);
      onClose();
    }
  };

  const handleShare = async () => {
    if (!currentTrack) return;
    const url = currentTrack.youtubeUrl || window.location.href;
    const text = `Listening to "${currentTrack.title}" by ${currentTrack.artist} on KingPlay!`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text} ${url}`);
        showToast({
          title: '🔗 Link Copied',
          message: 'Track link copied to clipboard. Share with friends!',
          type: 'success',
        });
      }
    } catch (err) {
      showToast({
        title: 'Share Link',
        message: url,
        type: 'info',
      });
    }
    onClose();
  };

  const handleOpenSleepTimer = () => {
    onClose();
    setSleepTimerModalOpen(true);
  };

  if (!isOpen || !currentTrack) return null;

  const isLiked = likedSongIds.has(currentTrack.id);

  // Active countdown string if sleep timer is on
  let sleepTimerLabel = 'Off';
  if (sleepTimer.enabled) {
    if (sleepTimer.mode === 'duration' && sleepTimer.endTime) {
      sleepTimerLabel = formatCountdown(Math.max(0, sleepTimer.endTime - Date.now()));
    } else if (sleepTimer.mode === 'end_of_song') {
      const remaining = duration > 0 ? Math.max(0, duration - currentTime) : 0;
      sleepTimerLabel = formatTime(remaining);
    }
  }

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Player menu"
      className={`absolute z-50 ${
        placement === 'top' ? 'bottom-full mb-3' : 'top-full mt-3'
      } ${align === 'right' ? 'right-0' : 'left-0'} w-64 sm:w-72 bg-[#12121E]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-1.5 text-slate-200 select-none animate-fadeIn`}
    >
      <AnimatePresence mode="wait">
        {!showPlaylistPicker ? (
          <motion.div
            key="main-menu"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-0.5"
          >
            {/* Header Track Info snippet */}
            <div className="px-3 py-2 border-b border-white/[0.08] mb-1">
              <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
              <p className="text-[11px] text-slate-400 truncate">{currentTrack.artist}</p>
            </div>

            {/* 1. Add to playlist */}
            <button
              onClick={handleOpenPlaylists}
              role="menuitem"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <FolderPlus className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span>Add to playlist</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* 2. Add to queue */}
            <button
              onClick={handleAddToQueue}
              role="menuitem"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer group"
            >
              <ListPlus className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Add to queue</span>
            </button>

            {/* 3. Like */}
            <button
              onClick={handleToggleLike}
              role="menuitem"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Heart
                  className={`w-4 h-4 ${
                    isLiked
                      ? 'fill-red-500 text-red-500'
                      : 'text-purple-400 group-hover:scale-110 transition-transform'
                  }`}
                />
                <span>{isLiked ? 'Liked' : 'Like'}</span>
              </div>
              {isLiked && <span className="text-[10px] text-red-400 font-medium">Added</span>}
            </button>

            {/* 4. Share */}
            <button
              onClick={handleShare}
              role="menuitem"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer group"
            >
              <Share2 className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Share</span>
            </button>

            {/* 5. Sleep Timer */}
            <div className="pt-1 mt-1 border-t border-white/[0.08]">
              <button
                onClick={handleOpenSleepTimer}
                role="menuitem"
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer group ${
                  sleepTimer.enabled
                    ? 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30'
                    : 'hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Moon
                    className={`w-4 h-4 ${
                      sleepTimer.enabled
                        ? 'fill-indigo-400 text-indigo-400'
                        : 'text-indigo-400 group-hover:scale-110 transition-transform'
                    }`}
                  />
                  <span className="font-semibold">Sleep Timer</span>
                </div>

                {sleepTimer.enabled ? (
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    {sleepTimerLabel}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">Off</span>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          /* Sub-panel: Select Playlist */
          <motion.div
            key="playlist-picker"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            className="space-y-1"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.08]">
              <button
                onClick={() => setShowPlaylistPicker(false)}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
              >
                ← Back
              </button>
              <span className="text-xs font-bold text-white">Add to Playlist</span>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 hover:bg-white/10 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto p-1 space-y-1">
              {isLoadingPlaylists ? (
                <div className="p-4 text-center text-xs text-slate-400">Loading playlists...</div>
              ) : userPlaylists.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No custom playlists found. Create one in Library!
                </div>
              ) : (
                userPlaylists.map((pl) => {
                  const isAdded = addedPlaylistIds.has(pl.id);
                  return (
                    <button
                      key={pl.id}
                      onClick={() => handleAddToPlaylist(pl)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ListMusic className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{pl.name}</span>
                      </div>
                      {isAdded && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
