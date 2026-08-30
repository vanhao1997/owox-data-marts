import { Button } from '@owox/ui/components/button';
import { ArchiveRestore, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function EmptyDataDestinationsState({
  onOpenTypeDialog,
}: {
  onOpenTypeDialog?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className='dm-empty-state' data-testid='destEmptyState'>
      <ArchiveRestore className='dm-empty-state-ico' strokeWidth={1} />
      <h2 className='dm-empty-state-title'>{t('destinationsPage.emptyTitle')}</h2>
      <p className='dm-empty-state-subtitle'>{t('destinationsPage.emptySubtitle')}</p>
      <Button variant='outline' onClick={onOpenTypeDialog}>
        <Plus className='h-4 w-4' />
        {t('destinationsPage.newDestination')}
      </Button>
    </div>
  );
}
