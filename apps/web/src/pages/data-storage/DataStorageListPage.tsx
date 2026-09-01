import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DataStorageProvider } from '../../features/data-storage/shared/model/context';
import { DataStorageList } from '../../features/data-storage/list/components';
import type { DataStorageList as DataStorageListItems } from '../../features/data-storage/shared/model/types/data-storage-list';
import { DataStorageType } from '../../features/data-storage/shared/model/types/data-storage-type.enum';
import {
  getCachedDataStorageHealthStatus,
  DataStorageHealthStatus,
  subscribeToDataStorageHealthStatusUpdates,
} from '../../features/data-storage/shared/services/data-storage-health-status.service';
import { PageNotificationLegacyStorageSetup } from './PageNotificationLegacyStorageSetup.tsx';
import { useParams } from 'react-router';

const DataStorageListWithContext = ({
  shouldOpenDialog,
  onTypeDialogClose,
}: {
  shouldOpenDialog: boolean;
  onTypeDialogClose: () => void;
}) => {
  const [dataStorages, setDataStorages] = useState<DataStorageListItems>([]);

  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    return subscribeToDataStorageHealthStatusUpdates(() => {
      setForceUpdate(forceUpdate => forceUpdate + 1);
    });
  }, []);

  const hasLegacyStorageWithoutAccess = dataStorages.some(storage => {
    if (storage.type !== DataStorageType.LEGACY_GOOGLE_BIGQUERY) {
      return false;
    }

    const cached = getCachedDataStorageHealthStatus(storage.id);

    return cached?.status === DataStorageHealthStatus.INVALID;
  });

  return (
    <>
      {hasLegacyStorageWithoutAccess && <PageNotificationLegacyStorageSetup />}

      <DataStorageList
        initialTypeDialogOpen={shouldOpenDialog}
        onTypeDialogClose={onTypeDialogClose}
        onDataStoragesChange={setDataStorages}
      />
    </>
  );
};

export const DataStorageListPage = () => {
  const { t } = useTranslation();
  const { projectId = '' } = useParams<{ projectId: string }>();
  const [shouldOpenDialog, setShouldOpenDialog] = useState(false);

  return (
    <div className='dm-page' data-testid='storageListPage'>
      <header className='dm-page-header'>
        <h1 className='dm-page-header-title'>{t('storagesPage.title', 'Storages')}</h1>
      </header>

      <div className='dm-page-content'>
        <DataStorageProvider key={projectId}>
          <DataStorageListWithContext
            shouldOpenDialog={shouldOpenDialog}
            onTypeDialogClose={() => {
              setShouldOpenDialog(false);
            }}
          />
        </DataStorageProvider>
      </div>
    </div>
  );
};
