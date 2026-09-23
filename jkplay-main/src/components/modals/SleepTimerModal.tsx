import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../stores/playerStore.js';
import { formatCountdown, formatTime } from '../../utils/formatTime.js';
import {
  Moon,
  Clock,
  Music,
  Check,
  X,
  Volume2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const PRESET_MINUTES = [5, 10, 15, 30, 45, 60];

export const SleepTimerModal: React.FC = () => {
  const {
    sleepTimer,
    isSleepTimerModalOpen,
    currentTrack,
    currentTime,
    duration,
    isPlaying,
    setSleepTimerModalOpen,
    startSleepTimer,
    cancelSleepTimer,
    setSleepTimerFadeOut,
  } = usePlayerStore();

  const [customMinutes, setCustomMinutes] = useState<number>(20);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(30);
  const [selectedMode, setSelectedMode] = useState<'duration' | 'end_of_song' | 'off'>(
    sleepTimer.enabled ? sleepTimer.mode : 'duration'
  );
  const [remainingTimeStr, setRemainingTimeStr] = useState<string>('00:00');
  const [remainingMs, setRemainingMs] = useState<number>(0);

  // Sync modal local state when modal opens or timer changes
  useEffect(() => {
    if (sleepTimer.enabled) {
      setSelectedMode(sleepTimer.mode);
      if (sleepTimer.mode === 'duration' && sleepTimer.durationMinutes) {
        setSelectedPreset(
          PRESET_MINUTES.includes(sleepTimer.durationMinutes)
            ? sleepTimer.durationMinutes
            : null
        );
        if (!PRESET_MINUTES.includes(sleepTimer.durationMinutes)) {
          setCustomMinutes(sleepTimer.durationMinutes);
        }
      }
    } else {
      setSelectedMode('off');
    }
  }, [sleepTimer.enabled, sleepTimer.mode, sleepTimer.durationMinutes, isSleepTimerModalOpen]);

  // Live countdown ticker inside the modal while open
  useEffect(() => {
    if (!isSleepTimerModalOpen) return;

    const updateCountdown = () => {
      if (sleepTimer.enabled && sleepTimer.mode === 'duration' && sleepTimer.endTime) {
        const diff = Math.max(0, sleepTimer.endTime - Date.now());
        setRemainingMs(diff);
        setRemainingTimeStr(formatCountdown(diff));
      } else {
        setRemainingMs(0);
        setRemainingTimeStr('00:00');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 500);
    return () => clearInterval(interval);
  }, [isSleepTimerModalOpen, sleepTimer.enabled, sleepTimer.endTime, sleepTimer.mode]);

  if (!isSleepTimerModalOpen) return null;

  const handleStartPreset = (minutes: number) => {
    setSelectedPreset(minutes);
    setSelectedMode('duration');
    startSleepTimer({
      mode: 'duration',
      minutes,
      fadeOut: sleepTimer.fadeOut,
    });
  };

  const handleStartEndOfSong = () => {
    setSelectedMode('end_of_song');
    setSelectedPreset(null);
    startSleepTimer({
      mode: 'end_of_song',
      fadeOut: sleepTimer.fadeOut,
    });
  };

  const handleStartCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Math.max(1, Math.min(720, Math.floor(customMinutes)));
    setSelectedPreset(parsed);
    setSelectedMode('duration');
    startSleepTimer({
      mode: 'duration',
      minutes: parsed,
      fadeOut: sleepTimer.fadeOut,
    });
  };

  const handleTurnOff = () => {
    setSelectedMode('off');
    cancelSleepTimer(true);
  };

  const endOfSongRemaining =
    duration > 0 ? Math.max(0, duration - currentTime) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sleep-timer-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md transition-all animate-fadeIn"
      onClick={() => setSleepTimerModalOpen(false)}
    >
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="w-full sm:max-w-md bg-[#0F0F1A] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-100 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle pull bar */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <Moon className="w-5 h-5 fill-indigo-400" />
            </div>
            <div>
              <h2 id="sleep-timer-title" className="text-base sm:text-lg font-bold text-white leading-tight">
                Sleep Timer
              </h2>
              <p className="text-xs text-slate-400">
                Automatically stop playback and fall asleep gently
              </p>
            </div>
          </div>
          <button
            onClick={() => setSleepTimerModalOpen(false)}
            aria-label="Close sleep timer"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Active Timer Status Banner (if currently running) */}
          {sleepTimer.enabled && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-white relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span>Timer Active</span>
                </div>
                <button
                  onClick={handleTurnOff}
                  className="px-2.5 py-1 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors border border-rose-500/20 cursor-pointer"
                >
                  Cancel Timer
                </button>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <div className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">
                    {sleepTimer.mode === 'duration' ? remainingTimeStr : formatTime(endOfSongRemaining)}
                  </div>
                  <div className="text-xs text-indigo-200/80 mt-1">
                    {sleepTimer.mode === 'duration'
                      ? `Music will stop in ${remainingTimeStr}`
                      : 'Music will stop when this song finishes'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Mode</div>
                  <div className="text-xs font-semibold text-white">
                    {sleepTimer.mode === 'duration' ? `${sleepTimer.durationMinutes || 30} mins` : 'End of track'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Presets Grid */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">
              <span>Duration Presets</span>
              <span className="text-[11px] text-slate-500 font-normal">Tap to activate</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {PRESET_MINUTES.map((mins) => {
                const isActive =
                  sleepTimer.enabled &&
                  sleepTimer.mode === 'duration' &&
                  sleepTimer.durationMinutes === mins;

                return (
                  <button
                    key={mins}
                    onClick={() => handleStartPreset(mins)}
                    className={`py-3 px-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-950/60 ring-2 ring-indigo-400/30'
                        : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] text-slate-200 hover:border-white/20'
                    }`}
                  >
                    <span className="text-sm sm:text-base font-bold">{mins}</span>
                    <span className="text-[10px] text-slate-400 font-medium">minutes</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* End of Current Song Option */}
          <div>
            <button
              onClick={handleStartEndOfSong}
              className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between text-left cursor-pointer ${
                sleepTimer.enabled && sleepTimer.mode === 'end_of_song'
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-950/60 ring-2 ring-indigo-400/30'
                  : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] text-slate-200 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/[0.08] text-indigo-300">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
                    End of current song
                    {sleepTimer.enabled && sleepTimer.mode === 'end_of_song' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-mono">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {currentTrack ? (
                      <span>
                        Stops after: <span className="text-slate-300 truncate max-w-[180px] inline-block align-bottom">{currentTrack.title}</span>
                      </span>
                    ) : (
                      'Pauses after currently active song finishes'
                    )}
                  </div>
                </div>
              </div>

              {currentTrack && duration > 0 && (
                <div className="text-right text-xs font-mono text-slate-400">
                  {formatTime(endOfSongRemaining)}
                </div>
              )}
            </button>
          </div>

          {/* Custom Duration Input */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <form onSubmit={handleStartCustom} className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <label htmlFor="custom-minutes-input" className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  Custom Time
                </label>
                <span className="text-[11px] text-slate-500">1 to 720 mins</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    id="custom-minutes-input"
                    type="number"
                    min="1"
                    max="720"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Minutes"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">
                    mins
                  </span>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-950/40 cursor-pointer"
                >
                  Start Timer
                </button>
              </div>
            </form>
          </div>

          {/* Fade-out before stopping Setting (Section 7) */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${sleepTimer.fadeOut ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-slate-500'}`}>
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-white">
                  Fade out before stopping
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Gradually lowers volume in the final 30 seconds
                </div>
              </div>
            </div>

            <button
              onClick={() => setSleepTimerFadeOut(!sleepTimer.fadeOut)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sleepTimer.fadeOut
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                  : 'bg-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {sleepTimer.fadeOut ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Turn Off Timer button (if timer is active) */}
          {sleepTimer.enabled ? (
            <button
              onClick={handleTurnOff}
              className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Turn Off Sleep Timer
            </button>
          ) : (
            <div className="text-center">
              <span className="text-[11px] text-slate-500">
                Timer status: <span className="text-slate-400">Off</span>
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
