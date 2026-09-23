import React, { useState, useEffect } from 'react';
import { Song, Playlist, Story, User } from '../types/index.js';
import { SongRow } from '../components/music/SongRow.js';
import { Search, Music, ListMusic, BookOpen, Users, Loader2 } from 'lucide-react';

interface SearchViewProps {
  onSelectPlaylist: (id: string) => void;
  onSelectStory: (story: Story) => void;
  allSongs: Song[];
  userPlaylists: Playlist[];
}

export const SearchView: React.FC<SearchViewProps> = ({
  onSelectPlaylist,
  onSelectStory,
  allSongs,
  userPlaylists,
}) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'songs' | 'playlists' | 'stories' | 'users'>('all');
  const [results, setResults] = useState<{
    songs: Song[];
    playlists: Playlist[];
    stories: Story[];
    users: User[];
  }>({
    songs: [],
    playlists: [],
    stories: [],
    users: [],
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults({ songs: [], playlists: [], stories: [], users: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&type=${searchType}`);
        const data = await res.json();
        if (data.success && data.data) {
          setResults({
            songs: data.data.songs || [],
            playlists: data.data.playlists || [],
            stories: data.data.stories || [],
            users: data.data.users || [],
          });
        }
      } catch (err) {
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, searchType]);

  const tabs: { key: typeof searchType; label: string; count?: number }[] = [
    { key: 'all', label: 'All Results' },
    { key: 'songs', label: `Songs (${results.songs.length})` },
    { key: 'playlists', label: `Playlists (${results.playlists.length})` },
    { key: 'stories', label: `Stories (${results.stories.length})` },
    { key: 'users', label: `Users (${results.users.length})` },
  ];

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Search Input Bar */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-purple-400" />
        <input
          type="text"
          placeholder="Search for tracks, artists, YouTube streams, playlists, stories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-10 py-3 bg-white/[0.04] border border-white/10 rounded-2xl text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-xl"
          autoFocus
        />
        {isSearching && (
          <div className="absolute right-4 top-3.5">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      {query.trim() && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSearchType(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                searchType === tab.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Results Content */}
      {!query.trim() ? (
        <div className="p-16 text-center text-slate-500 text-xs">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm text-slate-400 font-medium">Type anything to explore KingPlay</p>
          <p className="text-xs text-slate-500 mt-1">Search YouTube songs, road playlists, and lore stories</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Songs Results */}
          {(searchType === 'all' || searchType === 'songs') && results.songs.length > 0 && (
            <section>
              <h3 className="font-display font-bold text-base text-white mb-3 flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-400" />
                <span>Songs</span>
              </h3>
              <div className="space-y-1">
                {results.songs.map((song, idx) => (
                  <SongRow
                    key={song.id}
                    song={song}
                    index={idx}
                    allSongs={results.songs}
                    userPlaylists={userPlaylists}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Playlists Results */}
          {(searchType === 'all' || searchType === 'playlists') && results.playlists.length > 0 && (
            <section>
              <h3 className="font-display font-bold text-base text-white mb-3 flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-purple-400" />
                <span>Playlists</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {results.playlists.map((pl) => (
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
                      />
                    </div>
                    <h4 className="text-xs font-semibold text-white truncate">{pl.name}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{pl.songs.length} tracks</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Stories Results */}
          {(searchType === 'all' || searchType === 'stories') && results.stories.length > 0 && (
            <section>
              <h3 className="font-display font-bold text-base text-white mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>Stories</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {results.stories.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => onSelectStory(st)}
                    className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all cursor-pointer"
                  >
                    <span className="text-[10px] font-bold uppercase text-purple-400">
                      {st.category}
                    </span>
                    <h4 className="text-xs font-semibold text-white line-clamp-1 mt-1">
                      {st.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{st.excerpt}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty check */}
          {results.songs.length === 0 &&
            results.playlists.length === 0 &&
            results.stories.length === 0 &&
            results.users.length === 0 && (
              <div className="p-12 text-center text-slate-500 text-xs">
                No results found for "{query}". Try checking your spelling or search another keyword.
              </div>
            )}
        </div>
      )}
    </div>
  );
};
