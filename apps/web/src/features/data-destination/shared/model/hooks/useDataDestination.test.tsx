// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataDestinationProvider } from '../context';
import { useDataDestination } from './useDataDestination';

const mocks = vi.hoisted(() => ({
  getDataDestinationById: vi.fn(),
}));

vi.mock('../../services', () => ({
  dataDestinationService: {
    getDataDestinationById: mocks.getDataDestinationById,
  },
}));

vi.mock('../mappers/data-destination.mapper', () => ({
  mapDataDestinationFromDto: (value: unknown) => value,
}));

vi.mock('../../../../../components/AppSidebar/SetupChecklist/useSetupProgress', () => ({
  useRefreshSetupProgress: () => vi.fn(),
}));

const wrapper = ({ children }: PropsWithChildren) => (
  <DataDestinationProvider>{children}</DataDestinationProvider>
);

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(promiseResolve => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

describe('useDataDestination detail loading', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the mapped destination after updating the current detail', async () => {
    const destination = { id: 'destination-1' };
    mocks.getDataDestinationById.mockResolvedValue(destination);
    const { result } = renderHook(() => useDataDestination(), { wrapper });

    let loaded: unknown;
    await act(async () => {
      loaded = await result.current.getDataDestinationById(destination.id);
    });

    expect(loaded).toEqual(destination);
    expect(result.current.currentDataDestination).toEqual(destination);
    expect(result.current.loading).toBe(false);
  });

  it('rethrows detail errors so callers can avoid opening stale forms', async () => {
    const error = new Error('not found');
    mocks.getDataDestinationById.mockRejectedValue(error);
    const { result } = renderHook(() => useDataDestination(), { wrapper });

    await act(async () => {
      await expect(result.current.getDataDestinationById('destination-1')).rejects.toBe(error);
    });

    expect(result.current.currentDataDestination).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('not found');
  });

  it('returns null for a stale detail response', async () => {
    const first = deferred<{ id: string }>();
    const second = deferred<{ id: string }>();
    mocks.getDataDestinationById
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const { result } = renderHook(
      () => ({ firstConsumer: useDataDestination(), secondConsumer: useDataDestination() }),
      { wrapper }
    );

    let firstRequest!: Promise<unknown>;
    let secondRequest!: Promise<unknown>;
    act(() => {
      firstRequest = result.current.firstConsumer.getDataDestinationById('destination-old');
      secondRequest = result.current.secondConsumer.getDataDestinationById('destination-new');
    });

    await act(async () => {
      second.resolve({ id: 'destination-new' });
      await secondRequest;
      first.resolve({ id: 'destination-old' });
      await expect(firstRequest).resolves.toBeNull();
    });

    expect(result.current.firstConsumer.currentDataDestination).toEqual({ id: 'destination-new' });
  });
});
