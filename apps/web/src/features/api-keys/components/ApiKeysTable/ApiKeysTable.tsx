import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Row } from '@tanstack/react-table';
import { BaseTable, TableCTAButton } from '../../../../shared/components/Table';
import { useBaseTable } from '../../../../shared/hooks';
import { getApiKeysColumns } from './columns';
import type { ProjectMemberApiKey } from '../../types';

interface ApiKeysTableProps {
  keys: ProjectMemberApiKey[];
  onCreateKey: () => void;
  onOpenDetails: (key: ProjectMemberApiKey) => void;
  onEditName: (key: ProjectMemberApiKey) => void;
  onRevoke: (key: ProjectMemberApiKey) => void;
}

export function ApiKeysTable({
  keys,
  onCreateKey,
  onOpenDetails,
  onEditName,
  onRevoke,
}: ApiKeysTableProps) {
  const { t } = useTranslation();
  const columns = useMemo(
    () => getApiKeysColumns({ onEditName, onRevoke, t }),
    [onEditName, onRevoke, t]
  );

  const { table } = useBaseTable<ProjectMemberApiKey>({
    data: keys,
    columns,
    storageKeyPrefix: 'my-api-keys',
    enableRowSelection: false,
  });

  const handleRowClick = useCallback(
    (row: Row<ProjectMemberApiKey>, e: React.MouseEvent) => {
      if (
        e.target instanceof Element &&
        (e.target.closest('button') ||
          e.target.closest('a') ||
          e.target.closest('[role="button"]') ||
          e.target.closest('[role="menuitem"]') ||
          e.target.closest('[role="checkbox"]'))
      ) {
        return;
      }

      onOpenDetails(row.original);
    },
    [onOpenDetails]
  );

  return (
    <div className='dm-card'>
      <BaseTable
        tableId='my-api-keys'
        table={table}
        onRowClick={handleRowClick}
        renderToolbarLeft={() => <div />}
        renderToolbarRight={() => (
          <TableCTAButton onClick={onCreateKey}>{t('apiKeysPage.createButton')}</TableCTAButton>
        )}
      />
    </div>
  );
}
