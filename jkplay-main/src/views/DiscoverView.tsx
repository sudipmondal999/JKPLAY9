import React, { useState } from 'react';
import { Song, Playlist } from '../types/index.js';
import { SongCard } from '../components/music/SongCard.js';
import { SongRow } from '../components/music/SongRow.js';
import { Compass, Flame, Radio, Sparkles, Filter } from 'lucide-react';

interface DiscoverViewProps {
  songs: Song[];
  playlists: Playlist[];
  onSelectPlaylist: (id: string) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  songs,
  playlists,
  onSelectPlaylist,
}) => {
  const genres = [
    'All',
    'Synthwave / Retrowave',
    'Desert Rock / Heavy',
    'Lo-Fi Beats',
    'Acoustic / Indie',
    'Electronic / EDM',
    'Ambient / Cinematic',
  ];

  const [selectedGenre, setSelectedGenre] = useState('All');

  const filteredSongs =
    selectedGenre === 'All'
      ? songs
      : songs.filter((s) => s.genre?.toLowerCase().includes(selectedGenre.toLowerCase().split('/')[0].trim()));

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">
          <Compass className="w-4 h-4" />
          <span>Exploration Radar</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">
          Discover Soundscapes
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
          Dive through motorcycle highway soundtracks, chill lo-fi study beats, heavy rock riffs, and electronic rhythms.
        </p>
      </div>

      {/* Genre Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {genres.map((g) => {
          const isActive = selectedGenre === g;
          return (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30 font-semibold'
                  : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* Songs Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-white">
            {selectedGenre === 'All' ? 'All Genre Picks' : selectedGenre}
          </h2>
          <span className="text-xs text-slate-400">{filteredSongs.length} tracks</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredSongs.map((song) => (
            <SongCard key={song.id} song={song} playlistContext={filteredSongs} />
          ))}
        </div>
      </section>

      {/* Featured Community Playlists */}
      <section className="pt-4 border-t border-white/[0.06]">
        <h2 className="font-display font-bold text-lg text-white mb-4">
          Atmospheric Road Playlists
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl.id)}
              className="group flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-purple-500/30 transition-all cursor-pointer"
            >
              <img
                src={pl.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'}
                alt={pl.name}
                className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                  {pl.name}
                </h4>
                <p className="text-xs text-slate-400 truncate mt-0.5">{pl.description || 'Curated mix'}</p>
                <span className="text-[11px] text-purple-400 font-mono mt-1 block">
                  {pl.songs.length} tracks
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
