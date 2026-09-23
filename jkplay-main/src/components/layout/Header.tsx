import React, { useRef, useEffect } from 'react';
import { ActiveTab } from '../../types/index.js';
import { useAuthStore } from '../../stores/authStore.js';
import { useJamStore } from '../../stores/jamStore.js';
import {
  Search,
  Plus,
  Radio,
  User as UserIcon,
  ShieldAlert,
  Image as ImageIcon,
  Sliders,
  Upload,
  RefreshCw,
  Wind,
  Settings as SettingsIcon,
  X,
} from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore.js';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddSong: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddSong,
  onOpenAuth,
}) => {
  const { user } = useAuthStore();
  const { isInJam, room } = useJamStore();
  const {
    customWallpaper,
    wallpaperOpacity,
    motionEnabled,
    isSettingsOpen,
    setIsSettingsOpen,
    setCustomWallpaper,
    setWallpaperOpacity,
    setMotionEnabled,
    resetToDefault,
  } = useThemeStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click or Esc
  useEffect(() => {
    if (!isSettingsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSettingsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSettingsOpen, setIsSettingsOpen]);

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

  const navLinks: { tab: ActiveTab; label: string }[] = [
    { tab: 'home', label: 'Home' },
    { tab: 'discover', label: 'Discover' },
    { tab: 'music', label: 'Music' },
    { tab: 'stories', label: 'Stories' },
    { tab: 'library', label: 'Library' },
    { tab: 'jam', label: isInJam ? `Jam (${room?.roomCode || 'Live'})` : 'Jam Mode' },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#08080D]/85 backdrop-blur-xl">
      {/* Zone 1: Single text element wordmark */}
      <button
        onClick={() => setActiveTab('home')}
        className="flex items-center gap-2 text-left group focus:outline-none"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-display font-bold text-white text-lg shadow-lg shadow-purple-900/30 group-hover:scale-105 transition-transform">
          K
        </div>
        <span className="text-xl font-display font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
          KingPlay
        </span>
      </button>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
        {navLinks.map(({ tab, label }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative py-1 transition-colors whitespace-nowrap focus:outline-none ${
                isActive ? 'text-white font-semibold' : 'hover:text-white text-slate-400'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {tab === 'jam' && isInJam && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div ref={containerRef} className="flex items-center gap-3 relative">
        {/* Quick Search */}
        <button
          onClick={() => setActiveTab('search')}
          className={`p-2 rounded-lg transition-colors ${
            activeTab === 'search'
              ? 'bg-purple-600/20 text-purple-300'
              : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
          }`}
          title="Search KingPlay"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Add YouTube Song */}
        <button
          onClick={onOpenAddSong}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600/80 hover:bg-purple-600 border border-purple-400/20 rounded-lg shadow-sm hover:shadow-purple-900/30 transition-all whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Song</span>
        </button>

        {/* Himalayan 411 Background Settings */}
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={`p-2 rounded-lg transition-colors border cursor-pointer ${
            isSettingsOpen
              ? 'bg-purple-600/30 text-purple-300 border-purple-500/50 shadow-sm shadow-purple-900/40 ring-1 ring-purple-500/40'
              : 'text-slate-300 hover:text-white hover:bg-white/[0.06] border-white/[0.06]'
          }`}
          title="Himalayan 411 Wallpaper Controls"
          aria-label="Himalayan 411 Wallpaper Controls"
          aria-expanded={isSettingsOpen}
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Wallpaper Controls Popover Dropdown */}
        {isSettingsOpen && (
          <div className="absolute top-full right-0 mt-2 z-50 w-80 bg-[#12121C]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl text-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                Himalayan 411 Atmosphere
              </span>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-white/10 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Opacity Control */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Visibility Intensity</span>
                <span className="text-white font-mono">{Math.round(wallpaperOpacity * 100)}%</span>
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
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setWallpaperOpacity(0.95)}
                className={`py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  wallpaperOpacity >= 0.9 ? 'bg-purple-600 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                Poster 95%
              </button>
              <button
                onClick={() => setWallpaperOpacity(0.75)}
                className={`py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  wallpaperOpacity === 0.75 ? 'bg-purple-600 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                Studio 75%
              </button>
              <button
                onClick={() => setWallpaperOpacity(0.35)}
                className={`py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  wallpaperOpacity <= 0.4 ? 'bg-purple-600 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                Subtle 35%
              </button>
            </div>

            {/* Motion Effect Toggle: Light-Flicker & Cloud Drift */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className={`w-3.5 h-3.5 ${motionEnabled ? 'text-cyan-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-white font-medium text-[11px] flex items-center gap-1.5">
                    Cloud Drift & Lamp Glow
                    {motionEnabled && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">Ambient atmosphere</div>
                </div>
              </div>

              <button
                onClick={() => setMotionEnabled(!motionEnabled)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                  motionEnabled
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-900/40'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {motionEnabled ? 'ACTIVE' : 'PAUSED'}
              </button>
            </div>

            {/* Upload or Reset */}
            <div className="pt-2 border-t border-white/10 flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors font-medium text-[11px] cursor-pointer"
                title="Upload custom wallpaper image"
              >
                <Upload className="w-3 h-3 text-purple-300" />
                Upload Photo
              </button>
              <button
                onClick={resetToDefault}
                className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Reset to default Himalayan 411 artwork"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Full Settings Navigation Link */}
            <div className="pt-1">
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  setActiveTab('settings');
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1 text-slate-400 hover:text-purple-300 transition-colors text-[10px]"
              >
                <SettingsIcon className="w-3 h-3" />
                <span>Open Full Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* Admin Link if role is admin */}
        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'admin'
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
            }`}
            title="Admin Console"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        )}

        {/* User Profile or Login */}
        {user ? (
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 p-1 pl-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors focus:outline-none"
          >
            <span className="text-xs font-medium text-slate-200 hidden sm:inline-block max-w-[100px] truncate">
              {user.name.split(' ')[0]}
            </span>
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover border border-purple-500/30"
              referrerPolicy="no-referrer"
            />
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg transition-colors whitespace-nowrap"
          >
            <UserIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};

