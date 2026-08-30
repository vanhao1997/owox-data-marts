import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getInsightColumns, type InsightTableItem } from './columns';
import { BaseTable } from '../../../../../shared/components/Table';
import { useBaseTable } from '../../../../../shared/hooks';

interface InsightsTableProps {
  items: InsightTableItem[];
  onRowClick: (id: string) => void;
  onDelete: (id: string) => void;
}

export function InsightsTable({ items, onRowClick, onDelete }: InsightsTableProps) {
  const { t } = useTranslation();
  const columns = useMemo(() => getInsightColumns({ onDelete, t }), [onDelete, t]);

  const { table } = useBaseTable<InsightTableItem>({
    data: items,
    columns,
    storageKeyPrefix: 'data-mart-insights',
    defaultSortingColumn: 'lastRun',
    enableRowSelection: false,
  });

  const tableId = 'insights-table';

  return (
    <>
      <BaseTable
        tableId={tableId}
        table={table}
        onRowClick={row => {
          onRowClick(row.original.id);
        }}
        ariaLabel={t('insightsUi.insightPlural', 'Insights')}
        paginationProps={{
          displaySelected: false,
        }}
        renderEmptyState={() => (
          <span role='status' aria-live='polite'>
            {t('insightsUi.noInsightsFound', 'No insights found.')}
          </span>
        )}
      />
    </>
  );
}
