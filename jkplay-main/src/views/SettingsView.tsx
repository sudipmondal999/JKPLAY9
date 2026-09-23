import React, { useRef } from 'react';
import { usePlayerStore } from '../stores/playerStore.js';
import { useThemeStore } from '../stores/themeStore.js';
import { Settings, ShieldCheck, Volume2, Sparkles, Upload, RefreshCw, Sliders, Wind, Moon } from 'lucide-react';
import { formatCountdown } from '../utils/formatTime.js';

export const SettingsView: React.FC = () => {
  const {
    volume,
    sleepTimer,
    setVolume,
    setSleepTimerModalOpen,
    cancelSleepTimer,
    setSleepTimerFadeOut,
  } = usePlayerStore();
  const {
    customWallpaper,
    wallpaperOpacity,
    motionEnabled,
    setCustomWallpaper,
    setWallpaperOpacity,
    setMotionEnabled,
    resetToDefault,
  } = useThemeStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCustomWallpaper(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">
          <Settings className="w-4 h-4" />
          <span>System Preferences</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">
          Settings & Identity
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize playback parameters, Himalayan 411 wallpaper presentation, and compliance protocols.
        </p>
      </div>

      {/* Visual Identity Section: Royal Enfield Himalayan 411 */}
      <section className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="font-display font-bold text-base text-white">Himalayan 411 Wallpaper</h2>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-purple-600/30 text-purple-300 border border-purple-500/40">
            {customWallpaper ? 'Custom Photo Active' : 'Official Himalayan 411'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">
                Royal Enfield Himalayan 411 Studio Aesthetic
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                "Not built for speed… built for surviving every road" • Matte black adventure studio poster.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
              </button>

              <button
                onClick={resetToDefault}
                className="p-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white rounded-lg transition-colors"
                title="Reset to default Himalayan 411 artwork"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Opacity Slider */}
          <div className="pt-2 border-t border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                Wallpaper Visibility & Opacity
              </span>
              <span className="font-mono text-purple-300 font-bold">
                {Math.round(wallpaperOpacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={wallpaperOpacity}
              onChange={(e) => setWallpaperOpacity(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
            />

            {/* Presets */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setWallpaperOpacity(0.95)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  wallpaperOpacity >= 0.9 ? 'bg-purple-600 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                Poster 95% (Vivid)
              </button>
              <button
                onClick={() => setWallpaperOpacity(0.75)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  wallpaperOpacity === 0.75 ? 'bg-purple-600 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                Studio 75% (Balanced)
              </button>
              <button
                onClick={() => setWallpaperOpacity(0.35)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  wallpaperOpacity <= 0.4 ? 'bg-purple-600 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                Subtle 35% (Minimal)
              </button>
            </div>

            {/* Framer Motion Cloud Drift & Lamp Glow */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-white flex items-center gap-2">
                    Atmospheric Cloud Drift & Lamp Glow
                    {motionEnabled && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        60 FPS DRIFT
                      </span>
                    )}
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Smooth Framer Motion simulation mimicking mountain mist drift, light-flicker, and warm halogen filament shimmer.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMotionEnabled(!motionEnabled)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  motionEnabled
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-900/30'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {motionEnabled ? 'Enabled' : 'Paused'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Audio Playback Controls */}
      <section className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] space-y-5">
        <div className="flex items-center gap-2.5">
          <Volume2 className="w-5 h-5 text-purple-400" />
          <h2 className="font-display font-bold text-base text-white">Audio Stream Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-slate-200">Default Master Volume</h4>
              <p className="text-xs text-slate-500">Startup gain level</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-32 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-purple-500"
              />
              <span className="text-xs font-mono text-purple-300 w-8 text-right">{volume}%</span>
            </div>
          </div>

          {/* Sleep Timer Integration in Settings */}
          <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Moon className="w-4 h-4 fill-indigo-400/20" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                  Sleep Mode & Timer
                  {sleepTimer.enabled && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      ACTIVE ({sleepTimer.mode === 'duration' && sleepTimer.endTime ? formatCountdown(Math.max(0, sleepTimer.endTime - Date.now())) : 'End of Song'})
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Stop music after a fixed duration or at the end of the song with optional 30s gradual fade-out.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {sleepTimer.enabled ? (
                <>
                  <button
                    onClick={() => cancelSleepTimer(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setSleepTimerModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                  >
                    Adjust
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSleepTimerModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10 transition-colors cursor-pointer"
                >
                  Configure
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Architecture Specs */}
      <section className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="font-display font-bold text-base text-white">Compliance & Architecture</h2>
        </div>

        <div className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <strong className="text-slate-200 block mb-0.5">Official YouTube IFrame Engine</strong>
            KingPlay plays all tracks via the official YouTube embedded player API. No audio files or video media streams are ever downloaded, ripped, or stored on disk.
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <strong className="text-slate-200 block mb-0.5">Real-Time Jam Sync</strong>
            Jam Mode transmits authoritative playback coordinates across connected participants with millisecond network latency compensation via Socket.IO.
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <strong className="text-slate-200 block mb-0.5">Version & Build</strong>
            KingPlay v1.0.0 (Production) • React 19 • Tailwind CSS • Node.js Full-Stack
          </div>
        </div>
      </section>
    </div>
  );
};
