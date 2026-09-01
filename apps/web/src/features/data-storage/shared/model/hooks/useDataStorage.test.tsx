// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataStorageProvider } from '../context';
import { useDataStorage } from './useDataStorage';

const mocks = vi.hoisted(() => ({
  getDataStorageById: vi.fn(),
}));

vi.mock('../../api', () => ({
  dataStorageApiService: {
    getDataStorageById: mocks.getDataStorageById,
  },
}));

vi.mock('../mappers', () => ({
  mapDataStorageFromDto: (value: unknown) => value,
}));

vi.mock('../../../../../components/AppSidebar/SetupChecklist/useSetupProgress', () => ({
  useRefreshSetupProgress: () => vi.fn(),
}));

vi.mock('../../services/data-storage-health-status.service', () => ({
  invalidateDataStorageHealthStatus: vi.fn(),
}));

const wrapper = ({ children }: PropsWithChildren) => (
  <DataStorageProvider>{children}</DataStorageProvider>
);

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(promiseResolve => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

describe('useDataStorage detail loading', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null for a stale detail response', async () => {
    const first = deferred<{ id: string }>();
    const second = deferred<{ id: string }>();
    mocks.getDataStorageById.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { result } = renderHook(
      () => ({ firstConsumer: useDataStorage(), secondConsumer: useDataStorage() }),
      { wrapper }
    );

    let firstRequest!: Promise<unknown>;
    let secondRequest!: Promise<unknown>;
    act(() => {
      firstRequest = result.current.firstConsumer.getDataStorageById('storage-old');
      secondRequest = result.current.secondConsumer.getDataStorageById('storage-new');
    });

    await act(async () => {
      second.resolve({ id: 'storage-new' });
      await secondRequest;
      first.resolve({ id: 'storage-old' });
      await expect(firstRequest).resolves.toBeNull();
    });

    expect(result.current.firstConsumer.currentDataStorage).toEqual({ id: 'storage-new' });
  });
});
