import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '../../stores/playerStore.js';
import { formatTime, formatCountdown } from '../../utils/formatTime.js';
import { PlayerMenu } from './PlayerMenu.js';
import { RotateCcw10Icon, RotateCw10Icon } from './PlayerIcons.js';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  Maximize2,
  Tv,
  Moon,
  MoreVertical,
} from 'lucide-react';

export const GlobalPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeat,
    isQueueOpen,
    showVideoPlayer,
    likedSongIds,
    sleepTimer,
    togglePlay,
    nextTrack,
    prevTrack,
    skipForward,
    skipBackward,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    setFullscreen,
    setQueueOpen,
    setShowVideoPlayer,
    setSleepTimerModalOpen,
  } = usePlayerStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [countdownStr, setCountdownStr] = useState<string>('');

  // Real-time ticking countdown for active sleep timer display
  useEffect(() => {
    if (!sleepTimer.enabled) {
      setCountdownStr('');
      return;
    }

    const update = () => {
      if (sleepTimer.mode === 'duration' && sleepTimer.endTime) {
        const diff = Math.max(0, sleepTimer.endTime - Date.now());
        setCountdownStr(formatCountdown(diff));
      } else if (sleepTimer.mode === 'end_of_song') {
        const rem = duration > 0 ? Math.max(0, duration - currentTime) : 0;
        setCountdownStr(formatTime(rem));
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [sleepTimer.enabled, sleepTimer.mode, sleepTimer.endTime, duration, currentTime]);

  // Keyboard shortcuts for skip forward/backward (Left/Right arrow or J/L keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (!currentTrack) return;

      if (e.key === 'ArrowLeft' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        skipBackward(10);
      } else if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        skipForward(10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack, skipForward, skipBackward]);

  if (!currentTrack) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 z-40 h-[72px] bg-[#0E0E18]/90 backdrop-blur-xl border-t border-white/[0.08] flex items-center justify-between px-4 lg:px-8 text-slate-500 text-xs select-none">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <span className="text-slate-600 font-display">KP</span>
          </div>
          <div>
            <p className="text-slate-300 font-medium">Select a track to start playing</p>
            <p className="text-slate-500">YouTube embedded audio stream</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>KingPlay High-Fidelity Audio</span>
        </div>
      </footer>
    );
  }

  const isLiked = likedSongIds.has(currentTrack.id);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 h-[76px] lg:h-[84px] bg-[#0C0C14]/95 backdrop-blur-2xl border-t border-white/[0.08] flex items-center justify-between px-3 lg:px-6 select-none">
      {/* 1. Track Info (Artwork, Title, Artist, Heart) */}
      <div className="flex items-center gap-3 min-w-0 max-w-[32%] sm:max-w-[30%]">
        <div
          onClick={() => setFullscreen(true)}
          className="relative w-12 h-12 lg:w-13 lg:h-13 rounded-lg overflow-hidden bg-slate-900 border border-white/10 shrink-0 cursor-pointer group shadow-md"
        >
          <img
            src={currentTrack.thumbnailUrl}
            alt={currentTrack.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Maximize2 className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p
              onClick={() => setFullscreen(true)}
              className="text-xs lg:text-sm font-semibold text-white truncate cursor-pointer hover:underline"
            >
              {currentTrack.title}
            </p>
          </div>
          <p className="text-[11px] lg:text-xs text-slate-400 truncate">
            {currentTrack.artist}
          </p>
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={() => toggleLike(currentTrack.id)}
          className={`p-1.5 rounded-lg transition-colors focus:outline-none cursor-pointer ${
            isLiked ? 'text-red-500' : 'text-slate-500 hover:text-slate-300'
          }`}
          title={isLiked ? 'Unlike' : 'Like'}
          aria-label={isLiked ? 'Unlike track' : 'Like track'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
        </button>
      </div>

      {/* 2. Controls & Progress Bar */}
      <div className="flex flex-col items-center max-w-[46%] sm:max-w-[42%] w-full px-2">
        {/* Playback Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3.5 mb-1">
          {/* Shuffle (desktop) */}
          <button
            onClick={toggleShuffle}
            className={`hidden sm:inline-flex p-1.5 rounded transition-colors cursor-pointer ${
              shuffle ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Shuffle"
            aria-label="Toggle shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous Track */}
          <button
            onClick={prevTrack}
            className="p-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Previous (or restart)"
            aria-label="Previous track"
          >
            <SkipBack className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>

          {/* 10s Backward */}
          <button
            onClick={() => skipBackward(10)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer group active:scale-95"
            title="Rewind 10 seconds (←)"
            aria-label="Rewind 10 seconds"
          >
            <RotateCcw10Icon className="w-4 h-4 lg:w-4.5 lg:h-4.5 group-active:-rotate-45 transition-transform" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white text-slate-950 flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-purple-950/40 cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause playback' : 'Start playback'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 lg:w-5 lg:h-5 fill-slate-950" />
            ) : (
              <Play className="w-4 h-4 lg:w-5 lg:h-5 fill-slate-950 translate-x-0.5" />
            )}
          </button>

          {/* 10s Forward */}
          <button
            onClick={() => skipForward(10)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer group active:scale-95"
            title="Skip forward 10 seconds (→)"
            aria-label="Skip forward 10 seconds"
          >
            <RotateCw10Icon className="w-4 h-4 lg:w-4.5 lg:h-4.5 group-active:rotate-45 transition-transform" />
          </button>

          {/* Next Track */}
          <button
            onClick={nextTrack}
            className="p-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Next"
            aria-label="Next track"
          >
            <SkipForward className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>

          {/* Repeat (desktop) */}
          <button
            onClick={toggleRepeat}
            className={`hidden sm:inline-flex p-1.5 rounded transition-colors cursor-pointer ${
              repeat !== 'off' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={`Repeat (${repeat})`}
            aria-label={`Toggle repeat (currently ${repeat})`}
          >
            {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Progress Seek Bar & Timers */}
        <div className="w-full flex items-center gap-2 text-[10px] lg:text-[11px] font-mono tabular-nums text-slate-400">
          <span className="w-9 text-right">{formatTime(currentTime)}</span>
          <div className="relative flex-1 group py-1.5 flex items-center cursor-pointer">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer focus:outline-none accent-purple-500 group-hover:h-1.5 transition-all"
              aria-label="Playback seek slider"
            />
          </div>
          <span className="w-9">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. Utility Actions (Sleep Timer, Menu, Video Pip, Queue, Fullscreen, Volume) */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 min-w-0 max-w-[28%] justify-end">
        {/* Active Sleep Timer Pill OR Sleep Timer Button */}
        {sleepTimer.enabled ? (
          <button
            onClick={() => setSleepTimerModalOpen(true)}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 font-mono text-[11px] font-bold shadow-md shadow-indigo-950/40 transition-all cursor-pointer"
            title="Active Sleep Timer: click to change or cancel"
            aria-label={`Sleep timer active, ${countdownStr} remaining. Click to adjust.`}
          >
            <Moon className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400 animate-pulse" />
            <span className="tabular-nums">{countdownStr}</span>
          </button>
        ) : (
          <button
            onClick={() => setSleepTimerModalOpen(true)}
            className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-white/[0.05] rounded-lg transition-colors cursor-pointer"
            title="Open Sleep Timer"
            aria-label="Open sleep timer"
          >
            <Moon className="w-4 h-4" />
          </button>
        )}

        {/* Player Menu (Dropdown / Context menu: Add to playlist, Add to queue, Like, Share, Sleep Timer) */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isMenuOpen
                ? 'text-white bg-white/15'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
            title="Player options menu"
            aria-label="Open player options menu"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          <PlayerMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            align="right"
            placement="top"
          />
        </div>

        {/* Toggle YouTube Video Frame */}
        <button
          onClick={() => setShowVideoPlayer(!showVideoPlayer)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            showVideoPlayer
              ? 'text-purple-300 bg-purple-600/20'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
          }`}
          title="Toggle YouTube Video Screen"
          aria-label="Toggle YouTube video screen"
        >
          <Tv className="w-4 h-4" />
        </button>

        {/* Queue Drawer Toggle */}
        <button
          onClick={() => setQueueOpen(!isQueueOpen)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isQueueOpen
              ? 'text-purple-300 bg-purple-600/20'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
          }`}
          title="Play Queue"
          aria-label="Toggle play queue drawer"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Fullscreen Player Button */}
        <button
          onClick={() => setFullscreen(true)}
          className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors cursor-pointer"
          title="Fullscreen Player"
          aria-label="Expand to full screen player"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Volume Slider with Mute Toggle (desktop) */}
        <div className="hidden md:flex items-center gap-2 ml-1">
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-white focus:outline-none cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute volume' : 'Mute volume'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-18 lg:w-24 h-1 bg-white/15 rounded-full appearance-none cursor-pointer focus:outline-none accent-purple-400"
            title={`Volume: ${isMuted ? 0 : volume}%`}
            aria-label="Volume slider"
          />
        </div>
      </div>
    </footer>
  );
};
