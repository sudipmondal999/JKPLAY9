import React, { useEffect } from 'react';
import { usePlayerStore } from '../../stores/playerStore.js';

export const SleepTimerEngine: React.FC = () => {
  const tickSleepTimer = usePlayerStore((s) => s.tickSleepTimer);
  const isEnabled = usePlayerStore((s) => s.sleepTimer.enabled);

  useEffect(() => {
    if (!isEnabled) return;

    // Run tick immediately
    tickSleepTimer();

    // 1-second interval based on real Date.now()
    const timerId = setInterval(() => {
      tickSleepTimer();
    }, 1000);

    // When tab becomes active again from background throttling, immediately evaluate
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tickSleepTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isEnabled, tickSleepTimer]);

  return null;
};
