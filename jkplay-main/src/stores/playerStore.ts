import { create } from 'zustand';
import { Song, SleepTimerState } from '../types/index.js';
import { useAuthStore } from './authStore.js';
import { useToastStore } from './toastStore.js';

interface PlayerState {
  currentTrack: Song | null;
  queue: Song[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  isFullscreen: boolean;
  isQueueOpen: boolean;
  showVideoPlayer: boolean;
  likedSongIds: Set<string>;

  // Sleep Timer state
  sleepTimer: SleepTimerState;
  isSleepTimerModalOpen: boolean;

  // Actions
  playTrack: (track: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (time: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setFullscreen: (fullscreen: boolean) => void;
  setQueueOpen: (open: boolean) => void;
  setShowVideoPlayer: (show: boolean) => void;
  handleTrackEnded: () => void;
  toggleLike: (songId: string) => Promise<boolean>;
  fetchLikedSongs: () => Promise<void>;

  // Sleep Timer actions
  setSleepTimerModalOpen: (open: boolean) => void;
  startSleepTimer: (options: { mode: 'duration' | 'end_of_song'; minutes?: number; fadeOut?: boolean }) => void;
  cancelSleepTimer: (notify?: boolean) => void;
  setSleepTimerFadeOut: (fadeOut: boolean) => void;
  tickSleepTimer: () => void;
}

// Initialize persistent sleep timer state if still valid
const getInitialSleepTimer = (): SleepTimerState => {
  const fallback: SleepTimerState = {
    enabled: false,
    mode: 'duration',
    endTime: null,
    durationMinutes: null,
    fadeOut: true,
    originalVolume: null,
    isSleeping: false,
  };

  try {
    const raw = localStorage.getItem('kingplay_sleep_timer');
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.enabled) return fallback;

    if (parsed.mode === 'duration' && typeof parsed.endTime === 'number') {
      // Must not be expired
      if (parsed.endTime > Date.now()) {
        return {
          enabled: true,
          mode: 'duration',
          endTime: parsed.endTime,
          durationMinutes: parsed.durationMinutes || null,
          fadeOut: parsed.fadeOut !== false,
          originalVolume: typeof parsed.originalVolume === 'number' ? parsed.originalVolume : null,
          isSleeping: false,
        };
      } else {
        localStorage.removeItem('kingplay_sleep_timer');
        return fallback;
      }
    } else if (parsed.mode === 'end_of_song') {
      return {
        enabled: true,
        mode: 'end_of_song',
        endTime: null,
        durationMinutes: null,
        fadeOut: parsed.fadeOut !== false,
        originalVolume: typeof parsed.originalVolume === 'number' ? parsed.originalVolume : null,
        isSleeping: false,
      };
    }
  } catch (e) {
    localStorage.removeItem('kingplay_sleep_timer');
  }

  return fallback;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: Number(localStorage.getItem('kingplay_volume') || 80),
  isMuted: false,
  shuffle: false,
  repeat: 'off',
  isFullscreen: false,
  isQueueOpen: false,
  showVideoPlayer: false,
  likedSongIds: new Set<string>(),

  sleepTimer: getInitialSleepTimer(),
  isSleepTimerModalOpen: false,

  playTrack: (track, newQueue) => {
    let queue = newQueue ? [...newQueue] : [...get().queue];

    // If new track isn't in queue, add it
    let idx = queue.findIndex((s) => s.id === track.id);
    if (idx === -1) {
      queue.unshift(track);
      idx = 0;
    }

    set({
      currentTrack: track,
      queue,
      currentIndex: idx,
      isPlaying: true,
      currentTime: 0,
      duration: track.duration || 0,
    });

    // Record history on server
    const token = useAuthStore.getState().token;
    if (token) {
      fetch('/api/songs/history/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ songId: track.id }),
      }).catch(() => {});
    }
  },

  togglePlay: () => {
    const { isPlaying, currentTrack, queue } = get();
    if (!currentTrack && queue.length > 0) {
      get().playTrack(queue[0]);
      return;
    }
    set({ isPlaying: !isPlaying });
  },

  setPlaying: (playing) => set({ isPlaying: playing }),

  nextTrack: () => {
    const { queue, currentIndex, shuffle, repeat } = get();
    if (queue.length === 0) return;

    if (repeat === 'one') {
      set({ currentTime: 0, isPlaying: true });
      return;
    }

    let nextIndex = currentIndex + 1;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeat === 'all') {
        nextIndex = 0;
      } else {
        set({ isPlaying: false });
        return;
      }
    }

    const nextTrack = queue[nextIndex];
    if (nextTrack) {
      set({
        currentTrack: nextTrack,
        currentIndex: nextIndex,
        isPlaying: true,
        currentTime: 0,
        duration: nextTrack.duration || 0,
      });
    }
  },

  prevTrack: () => {
    const { queue, currentIndex, currentTime } = get();
    // If more than 3 seconds in, restart track
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    if (queue.length === 0) return;
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    const prevTrack = queue[prevIndex];
    if (prevTrack) {
      set({
        currentTrack: prevTrack,
        currentIndex: prevIndex,
        isPlaying: true,
        currentTime: 0,
        duration: prevTrack.duration || 0,
      });
    }
  },

  seekTo: (time) => {
    set({ currentTime: time });
  },

  skipForward: (seconds = 10) => {
    const { currentTime, duration } = get();
    const target = Math.min(duration || 0, currentTime + seconds);
    set({ currentTime: target });
  },

  skipBackward: (seconds = 10) => {
    const { currentTime } = get();
    const target = Math.max(0, currentTime - seconds);
    set({ currentTime: target });
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),

  setVolume: (vol) => {
    const clamped = Math.max(0, Math.min(100, Math.round(vol)));
    localStorage.setItem('kingplay_volume', clamped.toString());
    set({ volume: clamped, isMuted: clamped === 0 });
  },

  toggleMute: () => {
    set((state) => ({ isMuted: !state.isMuted }));
  },

  toggleShuffle: () => {
    set((state) => ({ shuffle: !state.shuffle }));
  },

  toggleRepeat: () => {
    set((state) => {
      const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
      const next = modes[(modes.indexOf(state.repeat) + 1) % modes.length];
      return { repeat: next };
    });
  },

  addToQueue: (track) => {
    set((state) => ({
      queue: [...state.queue, track],
    }));
    useToastStore.getState().showToast({
      title: 'Added to Queue',
      message: `${track.title} added to upcoming tracks`,
      type: 'success',
      duration: 2500,
    });
  },

  removeFromQueue: (index) => {
    set((state) => {
      const newQueue = [...state.queue];
      newQueue.splice(index, 1);
      let newIdx = state.currentIndex;
      if (index < state.currentIndex) {
        newIdx--;
      } else if (index === state.currentIndex && newIdx >= newQueue.length) {
        newIdx = Math.max(0, newQueue.length - 1);
      }
      return { queue: newQueue, currentIndex: newIdx };
    });
  },

  clearQueue: () => {
    set({ queue: [], currentIndex: -1, currentTrack: null, isPlaying: false });
  },

  setFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),
  setQueueOpen: (open) => set({ isQueueOpen: open }),
  setShowVideoPlayer: (show) => set({ showVideoPlayer: show }),

  handleTrackEnded: () => {
    const { sleepTimer, volume } = get();

    // Section 5: End of Song Mode Check
    if (sleepTimer.enabled && sleepTimer.mode === 'end_of_song') {
      // 1. Pause playback
      set({ isPlaying: false });

      // 2. Restore volume if it was fading out
      if (sleepTimer.originalVolume !== null) {
        get().setVolume(sleepTimer.originalVolume);
      }

      // 3. Sleep Mode OFF
      const stoppedState: SleepTimerState = {
        enabled: false,
        mode: 'duration',
        endTime: null,
        durationMinutes: null,
        fadeOut: sleepTimer.fadeOut,
        originalVolume: null,
        isSleeping: true,
      };
      set({ sleepTimer: stoppedState });
      localStorage.removeItem('kingplay_sleep_timer');

      // 4. Toast notification
      useToastStore.getState().showToast({
        title: '🌙 Sleep Mode',
        message: 'Playback has been stopped.\nGood night!',
        type: 'info',
        duration: 7000,
      });

      // 5. CRITICAL: Do NOT automatically play the next song!
      return;
    }

    get().nextTrack();
  },

  fetchLikedSongs: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    try {
      const res = await fetch('/api/songs/user/liked', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data?.songs) {
        const ids = new Set<string>(data.data.songs.map((s: Song) => s.id));
        set({ likedSongIds: ids });
      }
    } catch (err) {}
  },

  toggleLike: async (songId: string) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      useToastStore.getState().showToast({
        title: 'Authentication Required',
        message: 'Please sign in to like songs and save them to your library.',
        type: 'warning',
      });
      return false;
    }

    // Optimistic update
    const current = new Set(get().likedSongIds);
    const wasLiked = current.has(songId);
    if (wasLiked) {
      current.delete(songId);
    } else {
      current.add(songId);
    }
    set({ likedSongIds: current });

    useToastStore.getState().showToast({
      title: wasLiked ? 'Removed from Liked Songs' : 'Added to Liked Songs',
      type: 'success',
      duration: 2000,
    });

    try {
      const res = await fetch(`/api/songs/${songId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        return data.data.liked;
      } else {
        // Rollback
        get().fetchLikedSongs();
        return wasLiked;
      }
    } catch (err) {
      get().fetchLikedSongs();
      return wasLiked;
    }
  },

  // -------------------------------------------------------------
  // Sleep Timer Implementations
  // -------------------------------------------------------------

  setSleepTimerModalOpen: (open) => set({ isSleepTimerModalOpen: open }),

  startSleepTimer: ({ mode, minutes, fadeOut }) => {
    const currentFadeOut = fadeOut !== undefined ? fadeOut : get().sleepTimer.fadeOut;
    const currentVol = get().volume;

    if (mode === 'end_of_song') {
      const newState: SleepTimerState = {
        enabled: true,
        mode: 'end_of_song',
        endTime: null,
        durationMinutes: null,
        fadeOut: currentFadeOut,
        originalVolume: currentVol,
        isSleeping: false,
      };

      set({ sleepTimer: newState, isSleepTimerModalOpen: false });
      localStorage.setItem('kingplay_sleep_timer', JSON.stringify(newState));

      useToastStore.getState().showToast({
        title: '🌙 Sleep Timer started',
        message: 'Music will stop at the end of current song.',
        type: 'info',
        duration: 4000,
      });
      return;
    }

    const durationMins = minutes && minutes > 0 ? minutes : 30;
    const durationMs = durationMins * 60 * 1000;
    const endTime = Date.now() + durationMs;

    const newState: SleepTimerState = {
      enabled: true,
      mode: 'duration',
      endTime,
      durationMinutes: durationMins,
      fadeOut: currentFadeOut,
      originalVolume: currentVol,
      isSleeping: false,
    };

    set({ sleepTimer: newState, isSleepTimerModalOpen: false });
    localStorage.setItem('kingplay_sleep_timer', JSON.stringify(newState));

    useToastStore.getState().showToast({
      title: '🌙 Sleep Timer started',
      message: `Music will stop in ${durationMins} minutes.`,
      type: 'info',
      duration: 4000,
    });
  },

  cancelSleepTimer: (notify = true) => {
    const { sleepTimer, volume } = get();

    // If volume was currently being faded down, restore to original volume
    if (sleepTimer.originalVolume !== null && sleepTimer.originalVolume !== volume) {
      get().setVolume(sleepTimer.originalVolume);
    }

    const newState: SleepTimerState = {
      enabled: false,
      mode: 'duration',
      endTime: null,
      durationMinutes: null,
      fadeOut: sleepTimer.fadeOut,
      originalVolume: null,
      isSleeping: false,
    };

    set({ sleepTimer: newState });
    localStorage.removeItem('kingplay_sleep_timer');

    if (notify) {
      useToastStore.getState().showToast({
        title: '🌙 Sleep Timer cancelled',
        message: 'Playback will continue normally.',
        type: 'info',
        duration: 3000,
      });
    }
  },

  setSleepTimerFadeOut: (fadeOut) => {
    set((state) => {
      const updated = {
        ...state.sleepTimer,
        fadeOut,
      };
      if (updated.enabled) {
        localStorage.setItem('kingplay_sleep_timer', JSON.stringify(updated));
      }
      return { sleepTimer: updated };
    });
  },

  tickSleepTimer: () => {
    const { sleepTimer, isPlaying, volume } = get();
    if (!sleepTimer.enabled) return;

    const now = Date.now();

    // 1. Duration-based timer
    if (sleepTimer.mode === 'duration' && sleepTimer.endTime) {
      const remainingMs = sleepTimer.endTime - now;

      // Timer EXPIRED!
      if (remainingMs <= 0) {
        // Pause playback
        set({ isPlaying: false });

        // Restore user's original volume
        if (sleepTimer.originalVolume !== null) {
          get().setVolume(sleepTimer.originalVolume);
        }

        // Deactivate timer
        const stoppedState: SleepTimerState = {
          enabled: false,
          mode: 'duration',
          endTime: null,
          durationMinutes: null,
          fadeOut: sleepTimer.fadeOut,
          originalVolume: null,
          isSleeping: true,
        };
        set({ sleepTimer: stoppedState });
        localStorage.removeItem('kingplay_sleep_timer');

        // Notification
        useToastStore.getState().showToast({
          title: '🌙 Sleep Mode',
          message: 'Playback has been stopped.\nGood night!',
          type: 'info',
          duration: 7000,
        });
        return;
      }

      // Smooth Fade-out handling (last 30 seconds)
      if (sleepTimer.fadeOut && remainingMs <= 30000 && isPlaying) {
        if (sleepTimer.originalVolume === null) {
          // Record starting volume
          set((s) => ({
            sleepTimer: {
              ...s.sleepTimer,
              originalVolume: volume,
            },
          }));
        }

        const baseVol = sleepTimer.originalVolume ?? volume;
        const fractionRemaining = Math.max(0, remainingMs / 30000);
        const targetVol = Math.round(baseVol * fractionRemaining);

        // Adjust active playing volume without overwriting kingplay_volume in localStorage
        set({ volume: targetVol, isMuted: targetVol === 0 });
      }
    } else if (sleepTimer.mode === 'end_of_song') {
      // Optional fade out in the last 30s of the track
      const { duration, currentTime } = get();
      if (sleepTimer.fadeOut && duration > 0 && isPlaying) {
        const remainingTrackSec = duration - currentTime;
        if (remainingTrackSec <= 30 && remainingTrackSec > 0) {
          if (sleepTimer.originalVolume === null) {
            set((s) => ({
              sleepTimer: {
                ...s.sleepTimer,
                originalVolume: volume,
              },
            }));
          }
          const baseVol = sleepTimer.originalVolume ?? volume;
          const fractionRemaining = Math.max(0, remainingTrackSec / 30);
          const targetVol = Math.round(baseVol * fractionRemaining);
          set({ volume: targetVol, isMuted: targetVol === 0 });
        }
      }
    }
  },
}));
