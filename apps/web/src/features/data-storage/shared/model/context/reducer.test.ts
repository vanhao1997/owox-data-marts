import { describe, expect, it } from 'vitest';
import { DataStorageActionType } from './types';
import { initialDataStorageState, reducer } from './reducer';

describe('data storage reducer', () => {
  it.each([
    DataStorageActionType.FETCH_STORAGES_START,
    DataStorageActionType.FETCH_STORAGE_START,
    DataStorageActionType.CREATE_STORAGE_START,
    DataStorageActionType.UPDATE_STORAGE_START,
    DataStorageActionType.DELETE_STORAGE_START,
    DataStorageActionType.PUBLISH_DRAFTS_START,
  ])('marks %s as loading', type => {
    const state = reducer(
      { ...initialDataStorageState, error: { message: 'stale error' } as never },
      { type } as never
    );

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('clears stale details while a storage fetch is loading', () => {
    const state = reducer(
      {
        ...initialDataStorageState,
        currentDataStorage: { id: 'old-storage' } as never,
        error: { message: 'stale error' } as never,
      },
      { type: DataStorageActionType.FETCH_STORAGE_START, payload: 1 }
    );

    expect(state.currentDataStorage).toBeNull();
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('ignores an out-of-order storage detail response', () => {
    const loading = reducer(initialDataStorageState, {
      type: DataStorageActionType.FETCH_STORAGE_START,
      payload: 2,
    });
    const state = reducer(loading, {
      type: DataStorageActionType.FETCH_STORAGE_SUCCESS,
      payload: { requestId: 1, dataStorage: { id: 'old-storage' } as never },
    });

    expect(state).toBe(loading);
    expect(state.currentDataStorage).toBeNull();
    expect(state.loading).toBe(true);
  });

  it('invalidates an in-flight detail response when current storage is cleared', () => {
    const loading = reducer(initialDataStorageState, {
      type: DataStorageActionType.FETCH_STORAGE_START,
      payload: 1,
    });
    const cleared = reducer(loading, { type: DataStorageActionType.CLEAR_CURRENT_STORAGE });
    const state = reducer(cleared, {
      type: DataStorageActionType.FETCH_STORAGE_SUCCESS,
      payload: { requestId: 1, dataStorage: { id: 'stale-storage' } as never },
    });

    expect(state.currentDataStorage).toBeNull();
    expect(state.loading).toBe(false);
  });
});
