import React from 'react';
import { Song, Playlist } from '../../types/index.js';
import { usePlayerStore } from '../../stores/playerStore.js';
import { formatTime } from '../../utils/formatTime.js';
import { Play, Pause, Heart, ListPlus, MoreHorizontal, Youtube } from 'lucide-react';

interface SongRowProps {
  song: Song;
  index: number;
  allSongs?: Song[];
  userPlaylists?: Playlist[];
  onAddToPlaylist?: (songId: string, playlistId: string) => void;
  onRemoveFromPlaylist?: (songId: string) => void;
}

export const SongRow: React.FC<SongRowProps> = ({
  song,
  index,
  allSongs = [],
  userPlaylists = [],
  onAddToPlaylist,
  onRemoveFromPlaylist,
}) => {
  const {
    currentTrack,
    isPlaying,
    likedSongIds,
    playTrack,
    togglePlay,
    addToQueue,
    toggleLike,
  } = usePlayerStore();

  const isCurrentSong = currentTrack?.id === song.id;
  const isSongPlaying = isCurrentSong && isPlaying;
  const isLiked = likedSongIds.has(song.id);

  const handlePlayClick = () => {
    if (isCurrentSong) {
      togglePlay();
    } else {
      playTrack(song, allSongs.length > 0 ? allSongs : [song]);
    }
  };

  return (
    <div
      className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
        isCurrentSong
          ? 'bg-purple-600/15 border border-purple-500/30 text-purple-200'
          : 'hover:bg-white/[0.04] text-slate-300'
      }`}
    >
      {/* Left: Index / Play Button + Thumbnail + Title/Artist */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Track Number / Play Icon */}
        <div className="w-6 flex items-center justify-center shrink-0">
          <button
            onClick={handlePlayClick}
            className="w-6 h-6 flex items-center justify-center text-slate-400 group-hover:text-white"
          >
            {isSongPlaying ? (
              <div className="flex items-end gap-0.5 h-3.5">
                <span className="w-1 bg-purple-400 h-full animate-bounce" />
                <span className="w-1 bg-purple-400 h-2/3 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1 bg-purple-400 h-4/5 animate-bounce [animation-delay:0.4s]" />
              </div>
            ) : (
              <>
                <span className="text-xs font-mono text-slate-500 group-hover:hidden">
                  {index + 1}
                </span>
                <Play className="w-3.5 h-3.5 fill-current hidden group-hover:block" />
              </>
            )}
          </button>
        </div>

        {/* Thumbnail */}
        <div
          onClick={handlePlayClick}
          className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-900 border border-white/10 shrink-0 cursor-pointer"
        >
          <img
            src={song.thumbnailUrl}
            alt={song.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Title & Artist */}
        <div className="min-w-0 flex-1">
          <p
            onClick={handlePlayClick}
            className={`text-xs sm:text-sm font-semibold truncate cursor-pointer hover:underline ${
              isCurrentSong ? 'text-purple-300' : 'text-white'
            }`}
          >
            {song.title}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
            <span className="truncate">{song.artist}</span>
            {song.genre && (
              <>
                <span>•</span>
                <span className="text-[10px] text-slate-500">{song.genre}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Middle: Channel or Plays */}
      <div className="hidden md:block w-40 text-xs text-slate-400 truncate px-2">
        {song.channelName}
      </div>

      {/* Right: Actions & Duration */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Add to Queue */}
        <button
          onClick={() => addToQueue(song)}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all"
          title="Add to Queue"
        >
          <ListPlus className="w-4 h-4" />
        </button>

        {/* Favorite Heart */}
        <button
          onClick={() => toggleLike(song.id)}
          className={`p-1.5 rounded-lg transition-colors ${
            isLiked ? 'text-red-500' : 'text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100'
          }`}
          title={isLiked ? 'Remove Like' : 'Like'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 opacity-100' : ''}`} />
        </button>

        {/* Duration */}
        <span className="w-12 text-right text-xs font-mono tabular-nums text-slate-400">
          {formatTime(song.duration)}
        </span>
      </div>
    </div>
  );
};
