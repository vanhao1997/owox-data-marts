import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Row } from '@tanstack/react-table';
import { BaseTable } from '../../../../../shared/components/Table/BaseTable';
import { useBaseTable } from '../../../../../shared/hooks/useBaseTable';
import { getNotificationSettingsColumns } from './columns';
import type { NotificationSettingsItem } from '../../types';

interface NotificationSettingsTableProps {
  settings: NotificationSettingsItem[];
  onRowClick: (setting: NotificationSettingsItem) => void;
  onToggleEnabled: (setting: NotificationSettingsItem, enabled: boolean) => void | Promise<void>;
}

export function NotificationSettingsTable({
  settings,
  onRowClick,
  onToggleEnabled,
}: NotificationSettingsTableProps) {
  const { t } = useTranslation();
  const columns = useMemo(
    () => getNotificationSettingsColumns({ onToggleEnabled, onEdit: onRowClick, t }),
    [onToggleEnabled, onRowClick, t]
  );

  const { table } = useBaseTable<NotificationSettingsItem>({
    data: settings,
    columns,
    storageKeyPrefix: 'notification-settings',
    enableRowSelection: false,
  });

  const handleRowClick = (row: Row<NotificationSettingsItem>, e: React.MouseEvent) => {
    if (
      e.target instanceof HTMLElement &&
      (e.target.closest('[role="switch"]') || e.target.closest('button'))
    ) {
      return;
    }
    onRowClick(row.original);
  };

  return (
    <div className='dm-card' data-testid='notifSettingsTable'>
      <BaseTable
        tableId='notification-settings-table'
        table={table}
        onRowClick={handleRowClick}
        ariaLabel={t('notificationsPage.tableLabel')}
        showPagination={false}
        renderEmptyState={() => (
          <span role='status' aria-live='polite'>
            {t('notificationsPage.empty')}
          </span>
        )}
      />
    </div>
  );
}
