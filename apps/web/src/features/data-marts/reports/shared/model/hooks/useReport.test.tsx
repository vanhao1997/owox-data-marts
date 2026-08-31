// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportsProvider } from '../context';
import { useReport } from './useReport';

const mocks = vi.hoisted(() => ({
  deleteReport: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock('../../services', () => ({
  reportService: {
    deleteReport: mocks.deleteReport,
  },
  reportStatusPollingService: {
    stopAllPolling: vi.fn(),
    stopPolling: vi.fn(),
    startPolling: vi.fn(),
    setConfig: vi.fn(),
  },
}));

vi.mock('../../../../../data-destination', () => ({
  dataDestinationService: {},
}));

vi.mock('../../../../../../components/AppSidebar/SetupChecklist/useSetupProgress', () => ({
  useRefreshSetupProgress: () => vi.fn(),
}));

vi.mock('../../../../../../utils', () => ({
  trackEvent: mocks.trackEvent,
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn() },
}));

const wrapper = ({ children }: PropsWithChildren) => (
  <ReportsProvider>{children}</ReportsProvider>
);

describe('useReport delete contract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects a failed delete so callers do not continue as if it succeeded', async () => {
    const error = new Error('delete failed');
    mocks.deleteReport.mockRejectedValue(error);
    const { result } = renderHook(() => useReport(), { wrapper });

    await act(async () => {
      await expect(result.current.deleteReport('report-1')).rejects.toBe(error);
    });

    expect(result.current.error).toBe('delete failed');
    expect(mocks.trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'DeleteError', error: 'delete failed' })
    );
  });
});
