import React from 'react';
import { usePlayerStore } from '../../stores/playerStore.js';
import { X, Play, Trash2, Music2, ListMusic } from 'lucide-react';
import { formatTime } from '../../utils/formatTime.js';

export const QueueDrawer: React.FC = () => {
  const {
    isQueueOpen,
    setQueueOpen,
    queue,
    currentIndex,
    currentTrack,
    playTrack,
    removeFromQueue,
    clearQueue,
  } = usePlayerStore();

  if (!isQueueOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#0E0E18]/95 backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl flex flex-col transition-transform duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-purple-400" />
          <h2 className="font-display font-bold text-base text-white">Play Queue</h2>
          <span className="text-xs text-slate-400">({queue.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="text-xs text-slate-400 hover:text-red-400 px-2 py-1 rounded transition-colors"
              title="Clear Queue"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setQueueOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Now Playing card */}
      {currentTrack && (
        <div className="p-4 border-b border-white/[0.06] bg-purple-950/20">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-400 mb-2">
            Now Playing
          </div>
          <div className="flex items-center gap-3">
            <img
              src={currentTrack.thumbnailUrl}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-white truncate">{currentTrack.title}</h4>
              <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
          </div>
        </div>
      )}

      {/* Next In Queue */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Up Next
        </div>

        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs">
            <Music2 className="w-8 h-8 mb-2 opacity-40" />
            <p>Queue is empty</p>
          </div>
        ) : (
          queue.map((track, idx) => {
            const isPlayingThis = idx === currentIndex;
            return (
              <div
                key={`${track.id}-${idx}`}
                className={`group flex items-center justify-between p-2 rounded-xl transition-colors ${
                  isPlayingThis ? 'bg-purple-600/20 text-purple-200' : 'hover:bg-white/[0.04] text-slate-300'
                }`}
              >
                <div
                  onClick={() => playTrack(track, queue)}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                >
                  <div className="relative w-9 h-9 rounded-md overflow-hidden bg-black/40 shrink-0">
                    <img
                      src={track.thumbnailUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-medium truncate ${isPlayingThis ? 'text-purple-300 font-semibold' : 'text-slate-200'}`}>
                      {track.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-2">
                  <span className="text-[11px] font-mono text-slate-400">
                    {formatTime(track.duration)}
                  </span>
                  <button
                    onClick={() => removeFromQueue(idx)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 rounded transition-opacity"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
