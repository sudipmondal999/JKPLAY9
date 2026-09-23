import React, { useState } from 'react';
import { Song, Playlist } from '../types/index.js';
import { SongRow } from '../components/music/SongRow.js';
import { usePlayerStore } from '../stores/playerStore.js';
import { Music2, Play, Plus, Search, ArrowUpDown } from 'lucide-react';

interface MusicViewProps {
  songs: Song[];
  userPlaylists: Playlist[];
  onOpenAddSong: () => void;
  onAddToPlaylist?: (songId: string, playlistId: string) => void;
}

export const MusicView: React.FC<MusicViewProps> = ({
  songs,
  userPlaylists,
  onOpenAddSong,
  onAddToPlaylist,
}) => {
  const { playTrack } = usePlayerStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'artist' | 'duration'>('default');

  let filtered = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.artist.toLowerCase().includes(search.toLowerCase()) ||
      s.channelName.toLowerCase().includes(search.toLowerCase())
  );

  if (sortBy === 'title') {
    filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'artist') {
    filtered = [...filtered].sort((a, b) => a.artist.localeCompare(b.artist));
  } else if (sortBy === 'duration') {
    filtered = [...filtered].sort((a, b) => b.duration - a.duration);
  }

  const handlePlayAll = () => {
    if (filtered.length > 0) {
      playTrack(filtered[0], filtered);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">
            <Music2 className="w-4 h-4" />
            <span>Master Catalog</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">
            All Songs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {filtered.length} total tracks imported and playable via YouTube
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayAll}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-950 rounded-xl text-xs sm:text-sm font-semibold hover:scale-105 transition-all shadow-lg disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Play All</span>
          </button>

          <button
            onClick={onOpenAddSong}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add YouTube Song</span>
          </button>
        </div>
      </div>

      {/* Filter and Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tracks, artists, YouTube channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-[#12121E] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="default">Default Sort</option>
            <option value="title">Sort by Title</option>
            <option value="artist">Sort by Artist</option>
            <option value="duration">Sort by Duration</option>
          </select>
        </div>
      </div>

      {/* Track List Table */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-white/[0.06]">
          <div className="flex items-center gap-3.5 flex-1">
            <span className="w-6 text-center">#</span>
            <span className="ml-10">Title</span>
          </div>
          <span className="hidden md:block w-40 px-2">Channel</span>
          <span className="w-12 text-right">Time</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No tracks found matching your query.
          </div>
        ) : (
          filtered.map((song, index) => (
            <SongRow
              key={song.id}
              song={song}
              index={index}
              allSongs={filtered}
              userPlaylists={userPlaylists}
              onAddToPlaylist={onAddToPlaylist}
            />
          ))
        )}
      </div>
    </div>
  );
};
