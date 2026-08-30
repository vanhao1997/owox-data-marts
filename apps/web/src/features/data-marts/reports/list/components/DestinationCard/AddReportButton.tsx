import { Button } from '@owox/ui/components/button';
import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AddReportButtonProps {
  onAddReport: () => void;
}

/**
 * Button that triggers report creation.
 * Destination-type filtering and visibility are handled by the parent DestinationCard.
 */
export function AddReportButton({ onAddReport }: AddReportButtonProps) {
  const { t } = useTranslation();
  return (
    <Button
      onClick={onAddReport}
      variant='outline'
      size='sm'
      aria-label={t('reportsUi.addNewReport', 'Add new report')}
      data-testid='reportCreateButton'
      className='text-foreground'
    >
      <PlusIcon className='text-foreground h-4 w-4' />
      {t('reportsUi.newReport', 'New Report')}
    </Button>
  );
}
