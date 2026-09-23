import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../stores/playerStore.js';
import { useJamStore } from '../../stores/jamStore.js';
import { Maximize2, Minimize2, AlertCircle, Volume2, VolumeX } from 'lucide-react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

export const YouTubePlayer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const isReadyRef = useRef<boolean>(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    volume,
    isMuted,
    showVideoPlayer,
    isFullscreen,
    setPlaying,
    setCurrentTime,
    setDuration,
    handleTrackEnded,
    setShowVideoPlayer,
  } = usePlayerStore();

  const { isInJam, isHost, sendPlay, sendPause, sendSeek } = useJamStore();

  const [hasError, setHasError] = useState<string | null>(null);
  const [isPipFloating, setIsPipFloating] = useState<boolean>(false);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (playerRef.current || !containerRef.current) return;

      playerRef.current = new window.YT.Player('kingplay-yt-iframe', {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            isReadyRef.current = true;
            event.target.setVolume(isMuted ? 0 : volume);
            if (currentTrack) {
              if (isPlaying) {
                event.target.loadVideoById({
                  videoId: currentTrack.youtubeVideoId,
                  startSeconds: 0,
                });
                event.target.playVideo();
              } else {
                event.target.cueVideoById?.({
                  videoId: currentTrack.youtubeVideoId,
                  startSeconds: 0,
                });
              }
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 video cued
            if (event.data === 0) {
              handleTrackEnded();
            } else if (event.data === 1) {
              setPlaying(true);
              setHasError(null);
              const dur = event.target.getDuration();
              if (dur && dur > 0) setDuration(dur);
            } else if (event.data === 2) {
              setPlaying(false);
            }
          },
          onError: (event: any) => {
            console.warn('YouTube Player error code:', event.data);
            // 101 or 150: playback not allowed in embedded players, 100: video not found/private
            setHasError('This YouTube video cannot be played in embedded mode. Skipping to next...');
            setTimeout(() => {
              handleTrackEnded();
              setHasError(null);
            }, 2500);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Sync Video Change
  useEffect(() => {
    if (!currentTrack || !isReadyRef.current || !playerRef.current) return;
    try {
      setHasError(null);
      if (isPlaying) {
        playerRef.current.loadVideoById({
          videoId: currentTrack.youtubeVideoId,
          startSeconds: 0,
        });
        playerRef.current.playVideo?.();
      } else {
        playerRef.current.cueVideoById?.({
          videoId: currentTrack.youtubeVideoId,
          startSeconds: 0,
        });
      }
    } catch (err) {
      console.error('Error loading video:', err);
    }
  }, [currentTrack?.youtubeVideoId]);

  // Sync Play / Pause
  useEffect(() => {
    if (!isReadyRef.current || !playerRef.current) return;
    try {
      const state = playerRef.current.getPlayerState?.();
      if (isPlaying && state !== 1) {
        playerRef.current.playVideo?.();
        if (isInJam && isHost) {
          sendPlay(playerRef.current.getCurrentTime?.() || 0);
        }
      } else if (!isPlaying && state === 1) {
        playerRef.current.pauseVideo?.();
        if (isInJam && isHost) {
          sendPause(playerRef.current.getCurrentTime?.() || 0);
        }
      }
    } catch (err) {}
  }, [isPlaying]);

  // Sync Volume & Mute
  useEffect(() => {
    if (!isReadyRef.current || !playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.mute?.();
      } else {
        playerRef.current.unMute?.();
        playerRef.current.setVolume?.(volume);
      }
    } catch (err) {}
  }, [volume, isMuted]);

  // Sync Seek Time when external seek happens
  const lastTimeRef = useRef<number>(currentTime);
  useEffect(() => {
    if (!isReadyRef.current || !playerRef.current) return;
    // Only seek if difference is significant (> 1.5s difference from actual player time)
    const ytTime = playerRef.current.getCurrentTime?.() || 0;
    if (Math.abs(currentTime - ytTime) > 1.5) {
      playerRef.current.seekTo?.(currentTime, true);
      if (isInJam && isHost) {
        sendSeek(currentTime);
      }
    }
    lastTimeRef.current = currentTime;
  }, [currentTime]);

  // Poll elapsed time and sync to store
  useEffect(() => {
    progressIntervalRef.current = setInterval(() => {
      if (!isReadyRef.current || !playerRef.current) return;
      try {
        if (playerRef.current.getPlayerState?.() === 1) {
          const time = playerRef.current.getCurrentTime?.();
          const dur = playerRef.current.getDuration?.();
          if (typeof time === 'number') {
            setCurrentTime(time);
          }
          if (typeof dur === 'number' && dur > 0) {
            setDuration(dur);
          }
        }
      } catch (err) {}
    }, 500);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Toast error banner if YouTube video is non-embeddable */}
      {hasError && (
        <div className="fixed bottom-24 right-6 z-50 flex items-center gap-3 bg-red-950/90 border border-red-500/40 text-red-200 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md text-sm animate-bounce">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{hasError}</span>
        </div>
      )}

      {/* Floating or Docked YouTube Video Player */}
      <div
        className={`fixed transition-all duration-300 overflow-hidden shadow-2xl rounded-2xl border border-white/10 bg-black ${
          isFullscreen ? 'z-[60]' : 'z-40'
        } ${
          showVideoPlayer
            ? isFullscreen
              ? isPipFloating
                ? 'top-20 right-8 w-96 h-56'
                : 'top-24 left-1/2 -translate-x-1/2 w-[90vw] max-w-2xl h-[45vh]'
              : isPipFloating
                ? 'bottom-28 right-6 w-96 h-56'
                : 'bottom-24 right-6 md:right-10 w-80 md:w-96 h-48 md:h-56'
            : 'w-1 h-1 opacity-0 pointer-events-none -bottom-10 -right-10'
        }`}
      >
        {/* Floating Player Header Controls */}
        {showVideoPlayer && (
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/80 to-transparent">
            <span className="text-xs font-medium text-slate-300 truncate max-w-[200px]">
              {currentTrack?.title || 'YouTube Player'}
            </span>
            <div className="flex items-center gap-1.5">
              {currentTrack && (
                <a
                  href={`https://www.youtube.com/watch?v=${currentTrack.youtubeVideoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] px-2 py-0.5 bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white rounded transition-colors"
                  title="Open on YouTube"
                >
                  YouTube ↗
                </a>
              )}
              <button
                onClick={() => setIsPipFloating(!isPipFloating)}
                className="p-1 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors"
                title={isPipFloating ? 'Standard Size' : 'Float Large'}
              >
                {isPipFloating ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setShowVideoPlayer(false)}
                className="text-xs px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-slate-300 hover:text-white transition-colors"
              >
                Hide
              </button>
            </div>
          </div>
        )}

        {/* The YouTube iframe mount target */}
        <div ref={containerRef} className="w-full h-full">
          <div id="kingplay-yt-iframe" className="w-full h-full pointer-events-auto" />
        </div>
      </div>
    </>
  );
};
