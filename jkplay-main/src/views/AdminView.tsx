import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { Song, Playlist, Story, User } from '../types/index.js';
import {
  ShieldAlert,
  Users,
  Music2,
  ListMusic,
  BookOpen,
  Radio,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';

interface AdminViewProps {
  allSongs: Song[];
  allPlaylists: Playlist[];
  allStories: Story[];
  onSongDeleted?: (songId: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  allSongs,
  allPlaylists,
  allStories,
  onSongDeleted,
}) => {
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalSongs: allSongs.length,
    totalPlaylists: allPlaylists.length,
    totalStories: allStories.length,
    activeJamRooms: 0,
  });
  const [usersList, setUsersList] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'songs' | 'stories'>('overview');

  useEffect(() => {
    if (!token || user?.role !== 'admin') return;

    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.stats) {
          setStats(data.data.stats);
        }
      })
      .catch(() => {});

    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.users) {
          setUsersList(data.data.users);
        }
      })
      .catch(() => {});
  }, [token, user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-12 text-center text-red-400 text-sm">
        <ShieldAlert className="w-12 h-12 mx-auto mb-2 text-red-500" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-xs text-slate-400 mt-1">You must have an admin account to view this console.</p>
      </div>
    );
  }

  const handleDeleteSong = async (id: string) => {
    if (!window.confirm('Delete this song from master catalog?')) return;
    try {
      const res = await fetch(`/api/admin/songs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && onSongDeleted) {
        onSongDeleted(id);
      }
    } catch (err) {}
  };

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span>Root Governance</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">
          Admin Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Control users, moderate community YouTube tracks, playlists, and lore stories.
        </p>
      </div>

      {/* Dashboard Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Users</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-display font-bold text-2xl text-white font-mono">
            {stats.totalUsers}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Catalog Songs</span>
            <Music2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-display font-bold text-2xl text-white font-mono">
            {stats.totalSongs}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Playlists</span>
            <ListMusic className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-display font-bold text-2xl text-white font-mono">
            {stats.totalPlaylists}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Stories</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-display font-bold text-2xl text-white font-mono">
            {stats.totalStories}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Jams</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-display font-bold text-2xl text-emerald-400 font-mono">
            {stats.activeJamRooms}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
            activeTab === 'overview' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
          }`}
        >
          Users List ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('songs')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
            activeTab === 'songs' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
          }`}
        >
          Songs Catalog ({allSongs.length})
        </button>
        <button
          onClick={() => setActiveTab('stories')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
            activeTab === 'stories' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
          }`}
        >
          Stories ({allStories.length})
        </button>
      </div>

      {/* Tab 1: Users */}
      {activeTab === 'overview' && (
        <div className="space-y-2">
          {usersList.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
            >
              <div className="flex items-center gap-3">
                <img
                  src={u.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`}
                  alt={u.name}
                  className="w-9 h-9 rounded-full border border-white/10"
                />
                <div>
                  <h4 className="text-xs font-semibold text-white">{u.name}</h4>
                  <p className="text-[11px] text-slate-400">@{u.username} • {u.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                {u.role}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Songs */}
      {activeTab === 'songs' && (
        <div className="space-y-2">
          {allSongs.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={s.thumbnailUrl}
                  alt={s.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-white truncate">{s.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{s.artist} • {s.channelName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono text-slate-500">ID: {s.youtubeVideoId}</span>
                <button
                  onClick={() => handleDeleteSong(s.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                  title="Remove from catalog"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Stories */}
      {activeTab === 'stories' && (
        <div className="space-y-2">
          {allStories.map((st) => (
            <div
              key={st.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
            >
              <div>
                <h4 className="text-xs font-semibold text-white">{st.title}</h4>
                <p className="text-[11px] text-slate-400">By {st.authorName} • {st.category}</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Published
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
