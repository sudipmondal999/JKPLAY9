import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { Playlist, Song } from '../types/index.js';
import { SongRow } from '../components/music/SongRow.js';
import { User, LogOut, Edit3, ListMusic, Music, Check, Plus } from 'lucide-react';

interface ProfileViewProps {
  playlists: Playlist[];
  allSongs: Song[];
  onSelectPlaylist: (id: string) => void;
  onOpenAddSong: () => void;
  onOpenAuth: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  playlists,
  allSongs,
  onSelectPlaylist,
  onOpenAddSong,
  onOpenAuth,
}) => {
  const { user, logout, updateProfile } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [bioInput, setBioInput] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-display font-bold text-2xl text-white">Sign In to Your Profile</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          View your playlists, contributed songs, and listening statistics.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm shadow-xl"
        >
          Sign In
        </button>
      </div>
    );
  }

  const userPlaylists = playlists.filter((p) => p.ownerId === user.id);
  const userSongs = allSongs.filter((s) => s.createdBy === user.id);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({ name: nameInput, bio: bioInput });
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fadeIn">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/30 via-[#10101C] to-transparent border border-white/[0.08] shadow-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={user.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`}
          alt={user.name}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-purple-500/40 shadow-xl"
          referrerPolicy="no-referrer"
        />

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                  {user.name}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-600/30 text-purple-300 border border-purple-500/30">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">@{user.username}</p>
            </div>

            <div className="flex items-center justify-center sm:justify-end gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-slate-300 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs text-red-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Display Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Bio</label>
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <p className="text-xs sm:text-sm text-slate-300 mt-3 font-sans max-w-xl">
              {user.bio || 'Exploring atmospheric music and lore on KingPlay.'}
            </p>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-4 mt-4 pt-3 border-t border-white/[0.06] text-xs text-slate-400">
            <span>
              <strong className="text-white font-mono">{userPlaylists.length}</strong> Playlists
            </span>
            <span>•</span>
            <span>
              <strong className="text-white font-mono">{userSongs.length}</strong> YouTube Songs Added
            </span>
          </div>
        </div>
      </div>

      {/* User's Created Playlists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-purple-400" />
            <span>Playlists by You</span>
          </h2>
        </div>

        {userPlaylists.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No playlists created yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {userPlaylists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => onSelectPlaylist(pl.id)}
                className="group p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all cursor-pointer"
              >
                <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-900 border border-white/10 mb-2">
                  <img
                    src={pl.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'}
                    alt={pl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h4 className="text-xs font-semibold text-white truncate">{pl.name}</h4>
                <p className="text-[11px] text-slate-400 truncate">{pl.songs.length} tracks</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* User's Added YouTube Songs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Music className="w-4 h-4 text-purple-400" />
            <span>YouTube Songs Added by You</span>
          </h2>
          <button
            onClick={onOpenAddSong}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-white rounded-xl text-xs font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add More</span>
          </button>
        </div>

        {userSongs.length === 0 ? (
          <p className="text-xs text-slate-500 italic">You haven't contributed any songs yet.</p>
        ) : (
          <div className="space-y-1">
            {userSongs.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx}
                allSongs={userSongs}
                userPlaylists={userPlaylists}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
