import React from 'react';
import { ActiveTab, Playlist } from '../../types/index.js';
import { useAuthStore } from '../../stores/authStore.js';
import { useJamStore } from '../../stores/jamStore.js';
import {
  Home,
  Compass,
  Music2,
  BookOpen,
  Library,
  Radio,
  Settings,
  Heart,
  Clock,
  PlusSquare,
  ListMusic,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userPlaylists: Playlist[];
  onSelectPlaylist: (playlistId: string) => void;
  onCreatePlaylist: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userPlaylists,
  onSelectPlaylist,
  onCreatePlaylist,
}) => {
  const { user } = useAuthStore();
  const { isInJam } = useJamStore();

  const mainNav = [
    { tab: 'home' as ActiveTab, label: 'Home', icon: Home },
    { tab: 'discover' as ActiveTab, label: 'Discover', icon: Compass },
    { tab: 'music' as ActiveTab, label: 'Music', icon: Music2 },
    { tab: 'stories' as ActiveTab, label: 'Stories', icon: BookOpen },
    { tab: 'jam' as ActiveTab, label: 'Jam Mode', icon: Radio, badge: isInJam ? 'LIVE' : undefined },
  ];

  const libraryNav = [
    { tab: 'library' as ActiveTab, label: 'Your Library', icon: Library },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col h-[calc(100vh-65px-88px)] sticky top-[65px] border-r border-white/[0.06] bg-[#0A0A10]/60 backdrop-blur-xl p-4 overflow-y-auto">
      {/* Main Discover Menu */}
      <div className="space-y-1 mb-6">
        <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Menu
        </div>
        {mainNav.map(({ tab, label, icon: Icon, badge }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-purple-600/15 text-purple-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                <span>{label}</span>
              </div>
              {badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 animate-pulse">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Library Section */}
      <div className="space-y-1 mb-6">
        <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Library
        </div>
        {libraryNav.map(({ tab, label, icon: Icon }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-purple-600/15 text-purple-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* User Playlists List */}
      <div className="flex-1 min-h-[140px] flex flex-col">
        <div className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <span>Playlists</span>
          <button
            onClick={onCreatePlaylist}
            className="hover:text-purple-400 p-0.5 rounded transition-colors"
            title="Create Playlist"
          >
            <PlusSquare className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
          {userPlaylists.length === 0 ? (
            <p className="px-3 py-2 text-xs text-slate-500 italic">No playlists yet</p>
          ) : (
            userPlaylists.slice(0, 15).map((pl) => (
              <button
                key={pl.id}
                onClick={() => onSelectPlaylist(pl.id)}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] transition-colors text-left truncate group"
              >
                <ListMusic className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 shrink-0" />
                <span className="truncate">{pl.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Bottom Footer Shortcuts */}
      <div className="pt-3 border-t border-white/[0.06] space-y-1">
        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'admin'
                ? 'bg-amber-500/15 text-amber-300'
                : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Admin Console</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-purple-600/15 text-purple-300 font-semibold'
              : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
