import { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router';
import type { DataMartContextType } from '../../../../data-marts/edit/model/context/types';
import { useReport } from '../../../../data-marts/reports/shared/model/hooks';
import { useDataDestination } from './useDataDestination';

/**
 * Custom hook to fetch data destinations and associated reports for a specific Data Mart
 * - Combines multiple loading states into a single `isLoading` value
 * - Provides all destinations ready for presentation
 */
export function useDataDestinationsWithReports() {
  // Get the current Data Mart from outlet context
  const { dataMart } = useOutletContext<DataMartContextType>();
  const dataMartId = dataMart?.id;

  // Hook to manage reports
  const { fetchReportsByDataMartId } = useReport();

  // Hook to manage data destinations
  const {
    dataDestinations,
    fetchDataDestinations,
    loading: destinationsLoading,
  } = useDataDestination();

  // Local loading state for combined fetch
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const requestGenerationRef = useRef(0);

  const fetchData = useCallback(async () => {
    if (!dataMartId) return;

    const requestGeneration = ++requestGenerationRef.current;
    setIsLoading(true);
    setLoadError(false);
    const results = await Promise.allSettled([
      fetchDataDestinations(),
      fetchReportsByDataMartId(dataMartId),
    ]);
    if (requestGeneration !== requestGenerationRef.current) return;

    const failed = results.some(
      result => result.status === 'rejected' || result.value === undefined || result.value === false
    );
    setLoadError(failed);
    setIsLoading(false);
  }, [dataMartId, fetchDataDestinations, fetchReportsByDataMartId]);

  useEffect(() => {
    void fetchData();
    return () => {
      requestGenerationRef.current += 1;
    };
  }, [fetchData]);

  // Combine local loading with destinationsLoading from the DataDestination hook
  const combinedLoading = isLoading || destinationsLoading;

  return {
    dataDestinations,
    isLoading: combinedLoading,
    fetchDataDestinations,
    hasLoadError: loadError,
    retry: fetchData,
  };
}
