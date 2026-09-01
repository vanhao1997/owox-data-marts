import {
  DataMartListProvider,
  DataMartTable,
  useDataMartList,
} from '../../../features/data-marts/list';
import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getDataMartColumns } from '../../../features/data-marts/list/components/DataMartTable/columns/columns.tsx';
import { ConnectorContextProvider } from '../../../features/connectors/shared/model/context';
import { useConnector } from '../../../features/connectors/shared/model/hooks/useConnector.ts';
import {
  isDataQualityActivityState,
  RunActivityIndicator,
} from '../../../features/data-marts/shared/components/RunActivityIndicator';
import { useProjectRoute } from '../../../shared/hooks';
import { useDataQualitySummaries } from '../../../features/data-marts/data-quality';
import { DataMartsOverviewPanel } from '../../../features/data-marts/list/components/DataMartsOverviewPanel';
import { dataMartService } from '../../../features/data-marts/shared';
import { mapDataMartListFromDto } from '../../../features/data-marts/list/model/mappers/data-mart-list.mapper';
import { dataMartQueryKeys } from '../../../features/data-marts/shared/query-keys';
import { extractApiError } from '../../../app/api';

const DataMartsPageContent = () => {
  const { t } = useTranslation();
  const { deleteDataMart, publishDataMart } = useDataMartList();
  const { connectors, fetchAvailableConnectors } = useConnector();
  const { navigate, scope, projectId } = useProjectRoute();
  const dataMartsQuery = useQuery({
    queryKey: dataMartQueryKeys.all(projectId ?? ''),
    queryFn: async ({ signal }) => {
      const response = await dataMartService.getDataMarts({ signal });
      return mapDataMartListFromDto(response);
    },
    enabled: Boolean(projectId),
  });
  const items = dataMartsQuery.data ?? [];
  const loading = dataMartsQuery.isLoading;
  const error = dataMartsQuery.isError
    ? (extractApiError(dataMartsQuery.error).message ??
      t('dataMartsPage.loadFailed', 'Failed to load Data Marts. Please try again.'))
    : null;
  const { refetch: refetchDataMarts } = dataMartsQuery;
  const refreshList = useCallback(async () => {
    await refetchDataMarts();
  }, [refetchDataMarts]);
  const [visibleDataMartIds, setVisibleDataMartIds] = useState<string[]>([]);
  const qualitySummariesQuery = useDataQualitySummaries(projectId ?? '', visibleDataMartIds);
  const hasActiveQualityRun = Object.values(qualitySummariesQuery.data ?? {}).some(summary =>
    isDataQualityActivityState(summary?.state)
  );

  useEffect(() => {
    void fetchAvailableConnectors();
  }, [fetchAvailableConnectors]);

  return (
    <div className='dm-page'>
      <header className='dm-page-header'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <h1 className='dm-page-header-title'>{t('dataMartsPage.title', 'Data Marts')}</h1>
          <RunActivityIndicator
            active={hasActiveQualityRun}
            label={t('dataMartsPage.checkingQuality', 'Checking data quality')}
            onViewRuns={() => {
              navigate('/data-marts/runs');
            }}
          />
        </div>
      </header>
      <div className='px-4 md:px-8'>
        <DataMartsOverviewPanel
          items={items}
          qualitySummaries={qualitySummariesQuery.data}
          onViewRuns={scope('/data-marts/runs')}
          onCreateDataMart={scope('/data-marts/create')}
        />
      </div>
      <div className='dm-page-content'>
        <DataMartTable
          connectors={connectors}
          columns={getDataMartColumns({
            connectors,
            t,
            deleteDataMart,
            refreshList,
          })}
          data={items}
          deleteDataMart={deleteDataMart}
          publishDataMart={publishDataMart}
          refetchDataMarts={refreshList}
          onVisibleDataMartIdsChange={setVisibleDataMartIds}
          isLoading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default function DataMartsPage() {
  return (
    <DataMartListProvider>
      <ConnectorContextProvider>
        <DataMartsPageContent />
      </ConnectorContextProvider>
    </DataMartListProvider>
  );
}
