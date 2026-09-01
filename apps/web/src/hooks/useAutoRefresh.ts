import { useEffect, useRef } from 'react';

interface UseAutoRefreshOptions {
  enabled: boolean;
  intervalMs?: number | ((pollCount: number) => number);
  onlyWhenVisible?: boolean;
  runImmediately?: boolean;
  resourceKey?: string;
  onTick: (signal: AbortSignal) => unknown;
}

/**
 * Custom hook for auto-refreshing data at regular intervals
 *
 * @param enabled - Whether auto-refresh is enabled
 * @param intervalMs - Interval in milliseconds (default: 5000)
 * @param onlyWhenVisible - Only refresh when tab is visible (default: true)
 * @param runImmediately - Run once when the timer starts (default: true)
 * @param onTick - Callback function to execute on each tick, receives AbortSignal
 *
 * @example
 * useAutoRefresh({
 *   enabled: true,
 *   onTick: (signal) => {
 *     fetchData(id, { signal });
 *   }
 * });
 */
export function useAutoRefresh({
  enabled,
  intervalMs = 5000,
  onlyWhenVisible = true,
  runImmediately = true,
  resourceKey = '',
  onTick,
}: UseAutoRefreshOptions) {
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const activeControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;
    let pollCount = 0;

    const clearTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const abortActiveRequest = () => {
      activeControllerRef.current?.abort();
      activeControllerRef.current = null;
    };

    const schedule = () => {
      if (
        !disposed &&
        enabledRef.current &&
        (!onlyWhenVisible || document.visibilityState === 'visible')
      ) {
        const delay = typeof intervalMs === 'function' ? intervalMs(pollCount) : intervalMs;
        timerRef.current = window.setTimeout(tick, delay);
      }
    };

    const tick = () => {
      if (disposed) return;

      // Timer ids are one-shot; clear the handle as soon as it fires so a slow
      // request cannot leave stale timers behind.
      timerRef.current = null;

      if (onlyWhenVisible && document.visibilityState !== 'visible') {
        return;
      }

      // A slow request must not overlap the next polling attempt.
      if (activeControllerRef.current) {
        return;
      }

      const controller = new AbortController();
      activeControllerRef.current = controller;
      pollCount += 1;
      void Promise.resolve()
        .then(() => onTickRef.current(controller.signal))
        .catch(() => {
          // Callers own user-facing error state; polling must continue.
          return true;
        })
        .then(shouldContinue => {
          if (shouldContinue === false) {
            clearTimer();
            return;
          }
          schedule();
        })
        .finally(() => {
          if (activeControllerRef.current === controller) {
            activeControllerRef.current = null;
          }
        });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        clearTimer();
        abortActiveRequest();
      } else if (!activeControllerRef.current) {
        clearTimer();
        tick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (runImmediately) tick();
    else schedule();

    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimer();
      abortActiveRequest();
    };
  }, [enabled, intervalMs, onlyWhenVisible, resourceKey, runImmediately]);
}
