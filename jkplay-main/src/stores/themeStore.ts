import { create } from 'zustand';

interface ThemeState {
  customWallpaper: string | null;
  wallpaperOpacity: number;
  motionEnabled: boolean;
  isSettingsOpen: boolean;

  setCustomWallpaper: (url: string | null) => void;
  setWallpaperOpacity: (opacity: number) => void;
  setMotionEnabled: (enabled: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  resetToDefault: () => void;
}

const STORAGE_KEY = 'kingplay_custom_wallpaper';
const OPACITY_KEY = 'kingplay_wallpaper_opacity';
const MOTION_KEY = 'kingplay_wallpaper_motion';

export const useThemeStore = create<ThemeState>((set) => {
  const savedWallpaper = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  const savedOpacity = typeof window !== 'undefined' ? localStorage.getItem(OPACITY_KEY) : null;
  const savedMotion = typeof window !== 'undefined' ? localStorage.getItem(MOTION_KEY) : null;

  return {
    customWallpaper: savedWallpaper,
    wallpaperOpacity: savedOpacity ? parseFloat(savedOpacity) : 0.75,
    motionEnabled: savedMotion !== null ? savedMotion === 'true' : true,
    isSettingsOpen: false,

    setCustomWallpaper: (url: string | null) => {
      if (typeof window !== 'undefined') {
        if (url) {
          try {
            localStorage.setItem(STORAGE_KEY, url);
          } catch (e) {
            console.warn('Storage quota exceeded for custom wallpaper image, keeping in memory', e);
          }
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      set({ customWallpaper: url });
    },

    setWallpaperOpacity: (opacity: number) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(OPACITY_KEY, opacity.toString());
      }
      set({ wallpaperOpacity: opacity });
    },

    setMotionEnabled: (enabled: boolean) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(MOTION_KEY, enabled.toString());
      }
      set({ motionEnabled: enabled });
    },

    setIsSettingsOpen: (open: boolean) => set({ isSettingsOpen: open }),

    resetToDefault: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(OPACITY_KEY, '0.75');
        localStorage.setItem(MOTION_KEY, 'true');
      }
      set({ customWallpaper: null, wallpaperOpacity: 0.75, motionEnabled: true });
    },
  };
});
