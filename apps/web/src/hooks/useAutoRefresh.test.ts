import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAutoRefresh } from './useAutoRefresh';

describe('useAutoRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not overlap requests and aborts on unmount', async () => {
    let resolveTick: (() => void) | undefined;
    const onTick = vi.fn<(signal: AbortSignal) => Promise<void>>(() => {
      return new Promise<void>(resolve => {
        resolveTick = resolve;
      });
    });
    const { unmount } = renderHook(() => {
      useAutoRefresh({ enabled: true, intervalMs: 1000, onTick });
    });

    await act(async () => {
      await Promise.resolve();
    });
    expect(onTick).toHaveBeenCalledTimes(1);
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(onTick).toHaveBeenCalledTimes(1);

    const signal = onTick.mock.calls[0][0];
    unmount();
    expect(signal.aborted).toBe(true);
    if (resolveTick) resolveTick();
  });

  it('stops while hidden and runs immediately when visible again', async () => {
    const onTick = vi.fn().mockResolvedValue(undefined);
    const { unmount } = renderHook(() => {
      useAutoRefresh({
        enabled: true,
        intervalMs: 1000,
        onTick: signal => {
          onTick(signal);
        },
      });
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(onTick).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      vi.advanceTimersByTime(5000);
    });
    expect(onTick).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      await Promise.resolve();
    });
    expect(onTick).toHaveBeenCalledTimes(2);
    unmount();
  });

  it('aborts the active request when the resource key changes', async () => {
    const onTick = vi.fn<(signal: AbortSignal) => Promise<void>>(() => new Promise(() => {}));
    const { rerender } = renderHook(
      ({ resourceKey }: { resourceKey: string }) => {
        useAutoRefresh({ enabled: true, intervalMs: 1000, resourceKey, onTick });
      },
      { initialProps: { resourceKey: 'project-a' } }
    );

    await act(async () => {
      await Promise.resolve();
    });
    const firstSignal = onTick.mock.calls[0][0];

    rerender({ resourceKey: 'project-b' });

    expect(firstSignal.aborted).toBe(true);
  });

  it('stops scheduling when a tick reports terminal state', async () => {
    const onTick = vi.fn().mockResolvedValue(false);
    const { unmount } = renderHook(() => {
      useAutoRefresh({ enabled: true, intervalMs: 1000, onTick });
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      vi.advanceTimersByTime(5000);
    });

    expect(onTick).toHaveBeenCalledTimes(1);
    unmount();
  });
});
