import React, { useState, useEffect } from 'react';
import { Song, Playlist } from '../types/index.js';
import { useAuthStore } from '../stores/authStore.js';
import { usePlayerStore } from '../stores/playerStore.js';
import { SongRow } from '../components/music/SongRow.js';
import { Library, Heart, ListMusic, Clock, Plus, Music, Play } from 'lucide-react';

interface LibraryViewProps {
  playlists: Playlist[];
  allSongs: Song[];
  onSelectPlaylist: (id: string) => void;
  onCreatePlaylist: () => void;
  onOpenAddSong: () => void;
  onOpenAuth: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  playlists,
  allSongs,
  onSelectPlaylist,
  onCreatePlaylist,
  onOpenAddSong,
  onOpenAuth,
}) => {
  const { user, token } = useAuthStore();
  const { likedSongIds, playTrack } = usePlayerStore();

  const [activeTab, setActiveTab] = useState<'liked' | 'playlists' | 'history' | 'my_songs'>('liked');
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [myAddedSongs, setMyAddedSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch liked songs
  const likedSongs = allSongs.filter((s) => likedSongIds.has(s.id));

  // Fetch user history & added songs when signed in
  useEffect(() => {
    if (!token) return;

    if (activeTab === 'history') {
      setIsLoading(true);
      fetch('/api/songs/user/history', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.history) {
            setHistoryItems(data.data.history);
          }
        })
        .finally(() => setIsLoading(false));
    }

    if (activeTab === 'my_songs') {
      setIsLoading(true);
      fetch('/api/songs/user/added', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.songs) {
            setMyAddedSongs(data.data.songs);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [activeTab, token]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
          <Library className="w-8 h-8" />
        </div>
        <h2 className="font-display font-bold text-2xl text-white">Your Personal Library</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Sign in to save liked songs, create custom playlists, import YouTube mixes, and preserve your listening history.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-purple-950/40"
        >
          Sign In to KingPlay
        </button>
      </div>
    );
  }

  const userPlaylists = playlists.filter((p) => p.ownerId === user.id);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">
            <Library className="w-4 h-4" />
            <span>Personal Vault</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">
            Your Library
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCreatePlaylist}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600/80 hover:bg-purple-600 border border-purple-400/20 rounded-xl text-xs font-semibold text-white shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Playlist</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('liked')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'liked'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Liked Songs ({likedSongs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'playlists'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <ListMusic className="w-4 h-4" />
          <span>Your Playlists ({userPlaylists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'history'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Recently Played</span>
        </button>

        <button
          onClick={() => setActiveTab('my_songs')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'my_songs'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Added By You</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'liked' && (
        <div className="space-y-2">
          {likedSongs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              <Heart className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No liked songs yet. Click the heart icon on any song to save it here!</p>
            </div>
          ) : (
            likedSongs.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx}
                allSongs={likedSongs}
                userPlaylists={userPlaylists}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'playlists' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {userPlaylists.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-500 text-xs">
              <ListMusic className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>You haven't created any playlists yet.</p>
              <button
                onClick={onCreatePlaylist}
                className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold"
              >
                Create First Playlist
              </button>
            </div>
          ) : (
            userPlaylists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => onSelectPlaylist(pl.id)}
                className="group relative p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-purple-500/30 transition-all cursor-pointer flex flex-col"
              >
                <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-900 border border-white/10 mb-3 relative">
                  {pl.coverImage ? (
                    <img
                      src={pl.coverImage}
                      alt={pl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900 to-indigo-950 flex items-center justify-center text-purple-300 font-display font-bold text-2xl">
                      KP
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 fill-white translate-x-0.5" />
                    </div>
                  </div>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-white truncate">{pl.name}</h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {pl.songs.length} tracks • {pl.visibility}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-2">
          {historyItems.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No listening history yet. Play some tracks!</p>
            </div>
          ) : (
            historyItems.map((item, idx) => (
              <SongRow
                key={`${item.id}-${idx}`}
                song={item.song}
                index={idx}
                allSongs={historyItems.map((h) => h.song)}
                userPlaylists={userPlaylists}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'my_songs' && (
        <div className="space-y-2">
          {myAddedSongs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              <Music className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>You haven't added any YouTube songs yet.</p>
              <button
                onClick={onOpenAddSong}
                className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold"
              >
                Add Your First YouTube Song
              </button>
            </div>
          ) : (
            myAddedSongs.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx}
                allSongs={myAddedSongs}
                userPlaylists={userPlaylists}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
