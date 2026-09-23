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
  Heart,
  Volume2,
  VolumeX,
  Minimize2,
  Tv,
  Moon,
  MoreVertical,
} from 'lucide-react';

export const FullscreenPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeat,
    isFullscreen,
    likedSongIds,
    showVideoPlayer,
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
    setShowVideoPlayer,
    setSleepTimerModalOpen,
  } = usePlayerStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [countdownStr, setCountdownStr] = useState('');

  // Ticking countdown string for sleep timer
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

  if (!isFullscreen || !currentTrack) return null;

  const isLiked = likedSongIds.has(currentTrack.id);

  return (
    <div
      role="dialog"
      aria-label="Expanded fullscreen player"
      className="fixed inset-0 z-50 bg-[#07070B] text-white flex flex-col justify-between p-6 md:p-12 overflow-hidden animate-fadeIn select-none"
    >
      {/* Background blurred ambiance from track cover */}
      <div
        className="absolute inset-0 opacity-25 filter blur-[100px] scale-125 pointer-events-none bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${currentTrack.thumbnailUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07070B] via-transparent to-[#07070B]/80 pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-purple-400">
            Now Playing
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-xs text-slate-400">{currentTrack.genre || 'KingPlay Stream'}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Top ⋮ Menu button */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isMenuOpen
                  ? 'bg-white/15 border-white/30 text-white'
                  : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Player Options"
              aria-label="Open player options menu"
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            <PlayerMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              align="right"
              placement="bottom"
            />
          </div>

          <button
            onClick={() => setShowVideoPlayer(!showVideoPlayer)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              showVideoPlayer
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Toggle YouTube Video Frame"
            aria-label="Toggle YouTube video screen"
          >
            <Tv className="w-5 h-5" />
          </button>

          <button
            onClick={() => setFullscreen(false)}
            className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Exit Fullscreen"
            aria-label="Exit fullscreen mode"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Artwork & Visualizer */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center max-w-xl mx-auto w-full text-center">
        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/50 border border-white/10 mb-8 group">
          <img
            src={currentTrack.thumbnailUrl}
            alt={currentTrack.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />
        </div>

        {/* Title, Artist, & Favorite */}
        <div className="flex items-center justify-between w-full px-4 mb-6">
          <div className="text-left min-w-0 flex-1 mr-4">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white truncate">
              {currentTrack.title}
            </h1>
            <p className="text-base text-slate-400 truncate mt-1">
              {currentTrack.artist}
            </p>
          </div>
          <button
            onClick={() => toggleLike(currentTrack.id)}
            className={`p-3 rounded-full border transition-all cursor-pointer ${
              isLiked
                ? 'bg-red-500/15 border-red-500/30 text-red-500'
                : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title={isLiked ? 'Unlike' : 'Like'}
            aria-label={isLiked ? 'Unlike track' : 'Like track'}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500' : ''}`} />
          </button>
        </div>

        {/* Audio Waveform Bars (Interactive visual cue) */}
        <div className="flex items-end gap-1.5 h-8 mb-6">
          {Array.from({ length: 28 }).map((_, i) => {
            const height = isPlaying ? (15 + Math.sin(i * 0.7 + currentTime * 3) * 15) : 4;
            return (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-purple-500 to-indigo-400 rounded-full transition-all duration-150"
                style={{ height: `${Math.max(4, height)}px` }}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-10 max-w-2xl mx-auto w-full pb-4">
        {/* Progress Bar */}
        <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-slate-400 mb-6">
          <span className="w-12 text-right">{formatTime(currentTime)}</span>
          <div className="relative flex-1 group py-2 flex items-center cursor-pointer">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer focus:outline-none accent-purple-500 hover:h-2 transition-all"
              aria-label="Progress scrubber"
            />
          </div>
          <span className="w-12">{formatTime(duration)}</span>
        </div>

        {/* Playback Button Group with Shuffle, Repeat, and Sleep Timer (Section 12) */}
        <div className="flex items-center justify-between px-4 sm:px-8">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-colors cursor-pointer ${shuffle ? 'text-purple-400' : 'text-slate-400 hover:text-white'}`}
            title="Shuffle"
            aria-label="Toggle shuffle"
          >
            <Shuffle className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Prev */}
          <button
            onClick={prevTrack}
            className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Previous track"
            aria-label="Previous track"
          >
            <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* 10s Backward */}
          <button
            onClick={() => skipBackward(10)}
            className="p-2 sm:p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer group active:scale-95"
            title="Rewind 10 seconds (←)"
            aria-label="Rewind 10 seconds"
          >
            <RotateCcw10Icon className="w-6 h-6 sm:w-7 sm:h-7 group-active:-rotate-45 transition-transform" />
          </button>

          {/* Play / Pause Main CTA */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white text-slate-950 flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-purple-900/30 cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-slate-950" />
            ) : (
              <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-slate-950 translate-x-0.5" />
            )}
          </button>

          {/* 10s Forward */}
          <button
            onClick={() => skipForward(10)}
            className="p-2 sm:p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer group active:scale-95"
            title="Skip forward 10 seconds (→)"
            aria-label="Skip forward 10 seconds"
          >
            <RotateCw10Icon className="w-6 h-6 sm:w-7 sm:h-7 group-active:rotate-45 transition-transform" />
          </button>

          {/* Next */}
          <button
            onClick={nextTrack}
            className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Next track"
            aria-label="Next track"
          >
            <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`p-2 transition-colors cursor-pointer ${repeat !== 'off' ? 'text-purple-400' : 'text-slate-400 hover:text-white'}`}
            title={`Repeat (${repeat})`}
            aria-label={`Toggle repeat (${repeat})`}
          >
            {repeat === 'one' ? (
              <Repeat1 className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Repeat className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>

          {/* 🌙 Sleep Timer (Section 12: 🔀 🔁 🌙 Sleep 14:32) */}
          <button
            onClick={() => setSleepTimerModalOpen(true)}
            className={`relative p-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              sleepTimer.enabled
                ? 'text-indigo-300 bg-indigo-500/20 border border-indigo-400/40 shadow-lg shadow-indigo-950/60'
                : 'text-slate-400 hover:text-indigo-300 hover:bg-white/5'
            }`}
            title={
              sleepTimer.enabled
                ? `Sleep Timer active: ${countdownStr}`
                : 'Open Sleep Timer'
            }
            aria-label="Open sleep timer"
          >
            <Moon
              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                sleepTimer.enabled ? 'fill-indigo-400 text-indigo-400' : ''
              }`}
            />
            {sleepTimer.enabled && (
              <span className="text-[10px] font-mono font-bold mt-0.5 leading-none">
                {countdownStr}
              </span>
            )}
          </button>
        </div>

        {/* Bottom Volume Slider */}
        <div className="flex items-center justify-center gap-3 mt-6 max-w-xs mx-auto">
          <button onClick={toggleMute} className="text-slate-400 hover:text-white cursor-pointer" aria-label="Toggle mute">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-32 h-1 bg-white/20 rounded-full appearance-none cursor-pointer focus:outline-none accent-purple-400"
            aria-label="Volume control"
          />
        </div>
      </div>
    </div>
  );
};
