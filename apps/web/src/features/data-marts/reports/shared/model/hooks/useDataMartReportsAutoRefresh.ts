import { useCallback, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import type { DataMartContextType } from '../../../../edit/model/context/types';
import { useReport } from './useReport';
import { useAutoRefresh } from '../../../../../../hooks/useAutoRefresh';
import { ReportStatusEnum } from '../../enums';

interface Options {
  enabled?: boolean;
  intervalMs?: number;
  initialFetch?: boolean;
}

/**
 * Centralized auto-refresh for Data Mart reports.
 * Call once on the Data Mart page to ensure a single polling cycle per dataMart.id.
 */
export function useDataMartReportsAutoRefresh({
  enabled = true,
  intervalMs = 5000,
  initialFetch = true,
}: Options = {}) {
  const { dataMart } = useOutletContext<DataMartContextType>();
  const { reports, fetchReportsByDataMartId } = useReport();
  const dataMartId = dataMart?.id;
  const hasActiveReports = reports.some(
    report => report.lastRunStatus === ReportStatusEnum.RUNNING
  );
  const pollInterval = useCallback(
    (pollCount: number) => (pollCount < 3 ? 2000 : intervalMs),
    [intervalMs]
  );

  // Initial fetch on dataMart change
  useEffect(() => {
    if (!dataMartId || !initialFetch) return;
    void fetchReportsByDataMartId(dataMartId);
  }, [dataMartId, fetchReportsByDataMartId, initialFetch]);

  // Unified polling for the current dataMart
  useAutoRefresh({
    enabled: !!dataMartId && enabled && hasActiveReports,
    intervalMs: pollInterval,
    // The initial fetch is handled by the effect above. Avoid issuing the same
    // request twice when the refresh timer is created.
    runImmediately: false,
    onTick: signal => {
      if (!dataMartId) return;
      return fetchReportsByDataMartId(dataMartId, { silent: true, signal });
    },
    resourceKey: dataMartId,
  });
}
