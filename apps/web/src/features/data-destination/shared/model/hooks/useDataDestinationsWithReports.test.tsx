// @vitest-environment happy-dom
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDataDestinationsWithReports } from './useDataDestinationsWithReports';

const mocks = vi.hoisted(() => ({
  fetchDataDestinations: vi.fn(),
  fetchReportsByDataMartId: vi.fn(),
}));

vi.mock('react-router', () => ({
  useOutletContext: () => ({ dataMart: { id: 'data-mart-1' } }),
}));

vi.mock('./useDataDestination', () => ({
  useDataDestination: () => ({
    dataDestinations: [],
    fetchDataDestinations: mocks.fetchDataDestinations,
    loading: false,
  }),
}));

vi.mock('../../../../data-marts/reports/shared/model/hooks', () => ({
  useReport: () => ({
    fetchReportsByDataMartId: mocks.fetchReportsByDataMartId,
  }),
}));

describe('useDataDestinationsWithReports', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads destinations and reports once and exposes a retry callback', async () => {
    mocks.fetchDataDestinations.mockResolvedValue([]);
    mocks.fetchReportsByDataMartId.mockResolvedValue(true);

    const { result } = renderHook(() => useDataDestinationsWithReports());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mocks.fetchDataDestinations).toHaveBeenCalledTimes(1);
    expect(mocks.fetchReportsByDataMartId).toHaveBeenCalledWith('data-mart-1');
    expect(result.current.hasLoadError).toBe(false);
  });

  it('shows a load error when either sync request fails and clears it on retry', async () => {
    mocks.fetchDataDestinations.mockResolvedValueOnce(undefined).mockResolvedValueOnce([]);
    mocks.fetchReportsByDataMartId.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

    const { result } = renderHook(() => useDataDestinationsWithReports());

    await waitFor(() => {
      expect(result.current.hasLoadError).toBe(true);
    });

    await act(async () => {
      await result.current.retry();
    });

    expect(result.current.hasLoadError).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(mocks.fetchDataDestinations).toHaveBeenCalledTimes(2);
    expect(mocks.fetchReportsByDataMartId).toHaveBeenCalledTimes(2);
  });
});
