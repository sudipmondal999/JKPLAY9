import React from 'react';
import { Song } from '../../types/index.js';
import { usePlayerStore } from '../../stores/playerStore.js';
import { Play, Pause, Heart } from 'lucide-react';

interface SongCardProps {
  song: Song;
  playlistContext?: Song[];
}

export const SongCard: React.FC<SongCardProps> = ({ song, playlistContext }) => {
  const { currentTrack, isPlaying, likedSongIds, playTrack, togglePlay, toggleLike } =
    usePlayerStore();

  const isCurrent = currentTrack?.id === song.id;
  const isPlayingThis = isCurrent && isPlaying;
  const isLiked = likedSongIds.has(song.id);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(song, playlistContext || [song]);
    }
  };

  return (
    <div
      onClick={handlePlay}
      className="group relative p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-purple-500/30 transition-all duration-300 cursor-pointer flex flex-col shadow-sm hover:shadow-xl hover:shadow-purple-950/20"
    >
      {/* Thumbnail with overlay button */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 border border-white/10 mb-3">
        <img
          src={song.thumbnailUrl}
          alt={song.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Dark overlay */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center ${
            isPlayingThis ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-900/50 hover:scale-110 transition-transform">
            {isPlayingThis ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white translate-x-0.5" />
            )}
          </div>
        </div>

        {/* Favorite Heart corner badge */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(song.id);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-full bg-black/50 backdrop-blur-md transition-opacity ${
            isLiked ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100 text-white/80 hover:text-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500' : ''}`} />
        </button>
      </div>

      {/* Meta */}
      <div className="min-w-0 flex-1">
        <h4
          className={`text-xs sm:text-sm font-semibold truncate ${
            isCurrent ? 'text-purple-300' : 'text-white'
          }`}
        >
          {song.title}
        </h4>
        <p className="text-[11px] text-slate-400 truncate mt-0.5">{song.artist}</p>
      </div>
    </div>
  );
};
