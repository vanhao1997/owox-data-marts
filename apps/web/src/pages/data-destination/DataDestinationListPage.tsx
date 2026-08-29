import { DataDestinationProvider } from '../../features/data-destination';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataDestinationList } from '../../features/data-destination/list';

export const DataDestinationListPage = () => {
  const { t } = useTranslation();
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

  return (
    <div className='dm-page'>
      <header className='dm-page-header'>
        <h1 className='dm-page-header-title'>{t('destinationsPage.title', 'Destinations')}</h1>
      </header>

      <div className='dm-page-content'>
        <DataDestinationProvider>
          <DataDestinationList
            isCreateSheetInitiallyOpen={isCreateSheetOpen}
            onCreateSheetClose={() => {
              setIsCreateSheetOpen(false);
            }}
          />
        </DataDestinationProvider>
      </div>
    </div>
  );
};
