import { AccordionItem, AccordionTrigger, AccordionContent } from '@owox/ui/components/accordion';
import { useTranslation } from 'react-i18next';

export default function ExcelDescription() {
  const { t } = useTranslation();
  return (
    <AccordionItem value='excel-details'>
      <AccordionTrigger>{t('destinationHelp.excel.title', 'How do I connect to Microsoft Excel?')}</AccordionTrigger>
      <AccordionContent>
        <p className='mb-2'>
          {t('destinationHelp.excel.setup', 'There is nothing to set up here. The P2PDigital add-in for Excel creates this destination for you the first time you build a report from a workbook.')}
        </p>
        <p className='mb-2'>
          {t('destinationHelp.excel.credentials', 'Unlike other destinations, it stores no credentials: the add-in reads your data using your own P2PDigital access, and writes it into the worksheet you opened it from.')}
        </p>
      </AccordionContent>
    </AccordionItem>
  );
}
