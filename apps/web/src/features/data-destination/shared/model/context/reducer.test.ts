import { describe, expect, it } from 'vitest';
import { DataDestinationActionType } from './types';
import { initialDataDestinationState, reducer } from './reducer';

describe('data destination reducer', () => {
  it('clears stale details while a destination fetch is loading', () => {
    const state = reducer(
      {
        ...initialDataDestinationState,
        currentDataDestination: { id: 'old-destination' } as never,
        error: 'stale error',
      },
      { type: DataDestinationActionType.FETCH_DESTINATION_START, payload: 1 }
    );

    expect(state.currentDataDestination).toBeNull();
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('ignores an out-of-order destination detail response', () => {
    const loading = reducer(initialDataDestinationState, {
      type: DataDestinationActionType.FETCH_DESTINATION_START,
      payload: 2,
    });
    const state = reducer(loading, {
      type: DataDestinationActionType.FETCH_DESTINATION_SUCCESS,
      payload: { requestId: 1, dataDestination: { id: 'old-destination' } as never },
    });

    expect(state).toBe(loading);
    expect(state.currentDataDestination).toBeNull();
    expect(state.loading).toBe(true);
  });

  it('invalidates an in-flight detail response when current destination is cleared', () => {
    const loading = reducer(initialDataDestinationState, {
      type: DataDestinationActionType.FETCH_DESTINATION_START,
      payload: 1,
    });
    const cleared = reducer(loading, {
      type: DataDestinationActionType.CLEAR_CURRENT_DESTINATION,
    });
    const state = reducer(cleared, {
      type: DataDestinationActionType.FETCH_DESTINATION_SUCCESS,
      payload: { requestId: 1, dataDestination: { id: 'stale-destination' } as never },
    });

    expect(state.currentDataDestination).toBeNull();
    expect(state.loading).toBe(false);
  });
});
