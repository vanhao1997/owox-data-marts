import { Button } from '@owox/ui/components/button';
import { DatabaseZap, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function EmptyDataStoragesState({ onOpenTypeDialog }: { onOpenTypeDialog?: () => void }) {
  const { t } = useTranslation();

  return (
    <div className='dm-empty-state'>
      <DatabaseZap className='dm-empty-state-ico' strokeWidth={1} />
      <h2 className='dm-empty-state-title'>
        {t('storagesPage.emptyTitle', 'Connect your data warehouse')}
      </h2>
      <p className='dm-empty-state-subtitle'>
        {t(
          'storagesPage.emptySubtitle',
          'Centralize access to raw data by connecting data warehouse to build Data Marts and reports.'
        )}
      </p>
      <Button variant='outline' onClick={onOpenTypeDialog}>
        <Plus className='h-4 w-4' />
        {t('storagesPage.newStorage', 'New Storage')}
      </Button>
    </div>
  );
}
