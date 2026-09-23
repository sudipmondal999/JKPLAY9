import React from 'react';
import { Song, Playlist, Story, ActiveTab } from '../types/index.js';
import { usePlayerStore } from '../stores/playerStore.js';
import { SongCard } from '../components/music/SongCard.js';
import { SongRow } from '../components/music/SongRow.js';
import { Play, Sparkles, Radio, BookOpen, Compass, Plus, ArrowRight } from 'lucide-react';

interface HomeViewProps {
  songs: Song[];
  playlists: Playlist[];
  stories: Story[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectPlaylist: (playlistId: string) => void;
  onSelectStory: (story: Story) => void;
  onOpenAddSong: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  songs,
  playlists,
  stories,
  setActiveTab,
  onSelectPlaylist,
  onSelectStory,
  onOpenAddSong,
}) => {
  const { playTrack } = usePlayerStore();

  const featuredSong = songs[0];
  const quickMix = songs.slice(0, 6);
  const freshTracks = songs.slice(0, 8);
  const featuredStories = stories.slice(0, 3);

  return (
    <div className="space-y-10 pb-16 animate-fadeIn">
      {/* Hero Banner with Himalayan 411 Spirit */}
      <section className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-purple-950/40 via-[#11111E]/80 to-[#0A0A12]/90 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-400/30">
              Surviving Every Road
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              YouTube Powered Playback
            </span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Sound for the Long Distance.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed font-sans max-w-xl">
            Stream YouTube audio with seamless playback, create custom playlists, invite friends to synchronized <span className="text-purple-300 font-semibold">Jam Mode</span>, and explore deep artist stories.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {featuredSong && (
              <button
                onClick={() => playTrack(featuredSong, songs)}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white text-slate-950 font-semibold text-xs sm:text-sm hover:scale-105 transition-all shadow-xl shadow-purple-950/40"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Play Featured Stream</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('jam')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 font-semibold text-xs sm:text-sm transition-all"
            >
              <Radio className="w-4 h-4 text-purple-400" />
              <span>Start Jam Mode</span>
            </button>

            <button
              onClick={onOpenAddSong}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white font-medium text-xs sm:text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add YouTube URL</span>
            </button>
          </div>
        </div>

        {/* Decorative corner glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-purple-700/10 to-transparent pointer-events-none" />
      </section>

      {/* Quick Picks / Made For You (Grid of 6 quick bars) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-white">Quick Picks</h2>
          <button
            onClick={() => setActiveTab('music')}
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>View All Tracks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickMix.map((song) => (
            <div
              key={song.id}
              onClick={() => playTrack(song, songs)}
              className="group flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-purple-500/20 transition-all cursor-pointer shadow-sm"
            >
              <img
                src={song.thumbnailUrl}
                alt={song.title}
                className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                  {song.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">{song.artist}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 shadow-md">
                <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Playlists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-xl text-white">Curated Playlists</h2>
            <p className="text-xs text-slate-400">Road trips, midnight rides, and acoustic moods</p>
          </div>
          <button
            onClick={() => setActiveTab('library')}
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>Your Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => onSelectPlaylist(playlist.id)}
              className="group relative p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-purple-500/30 transition-all cursor-pointer flex flex-col"
            >
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-900 border border-white/10 mb-3 relative">
                {playlist.coverImage ? (
                  <img
                    src={playlist.coverImage}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
              <h4 className="text-xs sm:text-sm font-semibold text-white truncate">{playlist.name}</h4>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {playlist.songs.length} tracks • By {playlist.ownerName}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Fresh Music Catalog */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-xl text-white">Trending on KingPlay</h2>
            <p className="text-xs text-slate-400">Fresh YouTube additions from community listeners</p>
          </div>
          <button
            onClick={() => setActiveTab('music')}
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>Browse All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {freshTracks.map((song) => (
            <SongCard key={song.id} song={song} playlistContext={songs} />
          ))}
        </div>
      </section>

      {/* Stories Spotlight */}
      <section className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h2 className="font-display font-bold text-xl text-white">Editorial Stories</h2>
          </div>
          <button
            onClick={() => setActiveTab('stories')}
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>Read Stories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredStories.map((story) => (
            <div
              key={story.id}
              onClick={() => onSelectStory(story)}
              className="group p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-purple-500/30 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="h-36 rounded-xl overflow-hidden bg-slate-900 border border-white/10 mb-3 relative">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-purple-300">
                    {story.category}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
                  {story.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                  {story.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/[0.06] text-[11px] text-slate-500">
                <span>By {story.authorName}</span>
                <span>{story.readingTime}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
