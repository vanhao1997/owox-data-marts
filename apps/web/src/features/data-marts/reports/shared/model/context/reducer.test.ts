import { describe, expect, it } from 'vitest';
import { initialReportState, reducer } from './reducer';
import { ReportActionType } from './types';

describe('report reducer list requests', () => {
  it('ignores an out-of-order report list response', () => {
    const first = reducer(initialReportState, {
      type: ReportActionType.FETCH_REPORTS_START,
      payload: { requestId: 1, silent: false },
    });
    const second = reducer(first, {
      type: ReportActionType.FETCH_REPORTS_START,
      payload: { requestId: 2, silent: false },
    });
    const state = reducer(second, {
      type: ReportActionType.FETCH_REPORTS_SUCCESS,
      payload: { requestId: 1, reports: [{ id: 'stale-report' } as never], silent: false },
    });

    expect(state).toBe(second);
    expect(state.reports).toEqual([]);
    expect(state.loading).toBe(true);
  });

  it('keeps existing rows visible while a silent refresh is pending', () => {
    const state = reducer(
      { ...initialReportState, reports: [{ id: 'existing-report' } as never] },
      {
        type: ReportActionType.FETCH_REPORTS_START,
        payload: { requestId: 1, silent: true },
      }
    );

    expect(state.reports).toEqual([{ id: 'existing-report' }]);
    expect(state.loading).toBe(false);
    expect(state.reportsRequestId).toBe(1);
  });
});
