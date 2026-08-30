import { DataMartRunHistory } from '../../../features/data-marts/edit/components/DataMartRunHistory';
import {
  CollapsibleCard,
  CollapsibleCardHeader,
  CollapsibleCardHeaderTitle,
  CollapsibleCardContent,
} from '../../../shared/components/CollapsibleCard';
import { HistoryIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DataMartRunHistoryContent() {
  const { t } = useTranslation();
  return (
    <div className='flex flex-col gap-4' data-testid='runHistoryTab'>
      <CollapsibleCard collapsible={false} name='run-history'>
        <CollapsibleCardHeader>
          <CollapsibleCardHeaderTitle
            icon={HistoryIcon}
            tooltip={t(
              'dataMartRunHistory.tooltip',
              'View all Data Mart execution runs with detailed logs and errors'
            )}
          >
            {t('dataMartRunHistory.title', 'Run history')}
          </CollapsibleCardHeaderTitle>
        </CollapsibleCardHeader>
        <CollapsibleCardContent>
          <DataMartRunHistory />
        </CollapsibleCardContent>
      </CollapsibleCard>
    </div>
  );
}
