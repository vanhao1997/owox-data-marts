import { AccordionItem, AccordionTrigger, AccordionContent } from '@owox/ui/components/accordion';
import { useTranslation } from 'react-i18next';

export default function ODataDescription() {
  const { t } = useTranslation();
  return (
    <AccordionItem value='odata-details'>
      <AccordionTrigger>{t('destinationHelp.odata.title', 'How do I use OData?')}</AccordionTrigger>
      <AccordionContent>
        <p className='mb-2'>
          {t('destinationHelp.odata.description', 'OData (Open Data Protocol) is an ISO/IEC approved, OASIS standard that defines a set of best practices for building and consuming RESTful APIs.')}
        </p>
        <p className='mb-2'>{t('destinationHelp.odata.comingSoon', 'This feature is coming soon.')}</p>
      </AccordionContent>
    </AccordionItem>
  );
}
