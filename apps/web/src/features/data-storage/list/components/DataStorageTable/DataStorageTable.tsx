import { useMemo } from 'react';
import { type ColumnDef, type Row } from '@tanstack/react-table';
import { type DataStorageTableItem } from './columns';
import { useBaseTable } from '../../../../../shared/hooks';
import {
  BaseTable,
  TableColumnSearch,
  TableCTAButton,
} from '../../../../../shared/components/Table';
import { EmptyDataStoragesState } from './EmptyDataStoragesState';
import { DataStorageColumnKey } from './columns/columnKeys';
import { usePersistentFilters } from '../../../../../shared/hooks/usePersistentFilters';
import { applyFiltersToData } from '../../../../../shared/components/TableFilters/filter-utils';
import {
  buildDataStorageTableFilters,
  dataStorageFilterAccessors,
  type DataStorageFilterKey,
} from './DataStorageTableFilters.config';
import { DataStorageTableFilters } from './DataStorageTableFilters';
import { useParams } from 'react-router';
import { InviteTeammatesCard } from '../../../../../shared/components/InviteTeammatesCard';
import { useTranslation } from 'react-i18next';

interface DataStorageTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onEdit?: (id: string) => Promise<void>;
  onOpenTypeDialog?: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function DataStorageTable<TData, TValue>({
  columns,
  data,
  onEdit,
  onOpenTypeDialog,
  isLoading = false,
  error,
  onRetry,
}: DataStorageTableProps<TData, TValue>) {
  const { t } = useTranslation();
  const { projectId = '' } = useParams<{ projectId: string }>();
  const tableId = 'data-storage-table';

  const filtersConfig = useMemo(
    () => buildDataStorageTableFilters(data as DataStorageTableItem[], t),
    [data, t]
  );

  const { appliedState, apply, clear } = usePersistentFilters<DataStorageFilterKey>({
    projectId,
    tableId,
    urlParam: 'filters',
    config: filtersConfig,
  });

  const filteredData = useMemo(
    () =>
      applyFiltersToData<DataStorageFilterKey, DataStorageTableItem>(
        data as DataStorageTableItem[],
        appliedState,
        dataStorageFilterAccessors
      ) as TData[],
    [data, appliedState]
  );

  // Initialize table with shared hook
  const { table } = useBaseTable<TData>({
    data: filteredData,
    columns: columns as ColumnDef<TData>[],
    storageKeyPrefix: 'data-storage-list',
    enableRowSelection: false,
  });

  // Row click handler
  const handleRowClick = (row: Row<TData>, e: React.MouseEvent) => {
    if (
      e.target instanceof HTMLElement &&
      (e.target.closest('[role="checkbox"]') ||
        e.target.closest('.actions-cell') ||
        e.target.closest('[role="menuitem"]'))
    ) {
      return;
    }

    const id = (row.original as { id: string }).id;
    void onEdit?.(id);
  };

  if (!data.length) {
    return (
      <div className='flex flex-col gap-0.5'>
        <div className='dm-card'>
          {isLoading ? (
            <div className='text-muted-foreground p-6 text-center text-sm'>
              {t('common.loading', 'Loading...')}
            </div>
          ) : error ? (
            <div className='flex flex-col items-center gap-3 p-6 text-center text-sm'>
              <p className='text-muted-foreground'>{error}</p>
              {onRetry && (
                <button
                  type='button'
                  className='border-input hover:bg-muted rounded-md border px-3 py-1.5 transition-colors'
                  onClick={onRetry}
                >
                  {t('common.retry', 'Retry')}
                </button>
              )}
            </div>
          ) : (
            <EmptyDataStoragesState onOpenTypeDialog={onOpenTypeDialog} />
          )}
        </div>
        {!isLoading && !error && (
          <InviteTeammatesCard
            hint={t('storagesPage.inviteHint')}
            docsLabel={t('storagesPage.learnMore')}
            docsHref='https://docs.p2pdigital.io.vn/docs/storages/manage-storages/'
          />
        )}
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      {error && (
        <div
          className='dm-card-block flex items-center justify-between gap-3 text-sm'
          role='status'
        >
          <span className='text-muted-foreground'>{error}</span>
          {onRetry && (
            <button
              type='button'
              className='text-primary font-medium underline underline-offset-4'
              onClick={onRetry}
            >
              {t('common.retry', 'Retry')}
            </button>
          )}
        </div>
      )}
      <div className='dm-card' data-testid='storageTable'>
        <BaseTable
          tableId={tableId}
          table={table}
          onRowClick={handleRowClick}
          ariaLabel={t('storagesPage.tableAriaLabel', 'Storages table')}
          paginationProps={{ displaySelected: false }}
          renderToolbarLeft={() => (
            <>
              <DataStorageTableFilters
                appliedState={appliedState}
                config={filtersConfig}
                onApply={apply}
                onClear={clear}
              />
              <TableColumnSearch
                table={table}
                columnId={DataStorageColumnKey.TITLE}
                placeholder={t('search.button')}
              />
            </>
          )}
          renderToolbarRight={() => (
            <TableCTAButton onClick={onOpenTypeDialog}>
              {t('storagesPage.newStorage')}
            </TableCTAButton>
          )}
        />
      </div>
    </div>
  );
}
