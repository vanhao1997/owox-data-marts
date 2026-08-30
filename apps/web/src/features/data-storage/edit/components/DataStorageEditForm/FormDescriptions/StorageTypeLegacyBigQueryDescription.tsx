import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@owox/ui/components/accordion';
import { ExternalAnchor } from '@owox/ui/components/common/external-anchor';
import { useTranslation } from 'react-i18next';

export default function StorageTypeLegacyBigQueryDescription() {
  const { t } = useTranslation();

  return (
    <Accordion variant='common' type='single' collapsible>
      <AccordionItem value='legacy-bigquery-storage-type-details'>
        <AccordionTrigger>{t('storageHelp.legacyBigQuery.title')}</AccordionTrigger>
        <AccordionContent>
          <p className='mb-2'>
            {t('storageHelp.legacyBigQuery.intro')}{' '}
            <ExternalAnchor
              className='underline'
              href='https://workspace.google.com/marketplace/app/owox_bigquery_data_marts/263000453832'
            >
              {t('storageHelp.legacyBigQuery.extension')}
            </ExternalAnchor>{' '}
            {t('storageHelp.legacyBigQuery.suffix')}
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
