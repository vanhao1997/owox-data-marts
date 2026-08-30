import { AccordionItem, AccordionTrigger, AccordionContent } from '@owox/ui/components/accordion';
import { ExternalAnchor } from '@owox/ui/components/common/external-anchor';
import { useTranslation } from 'react-i18next';

export default function EmailDescription() {
  const { t } = useTranslation();
  return (
    <AccordionItem value='email-details'>
      <AccordionTrigger>{t('destinationHelp.email.title', 'How do I start sending Email?')}</AccordionTrigger>
      <AccordionContent>
        <p className='mb-2'>
          {t('destinationHelp.email.setup', 'To send reports by email, first configure the')}{' '}
          <strong>Email</strong>{' '}
          {t('destinationHelp.email.setupAfterEmail', "destination in this form (add a title and specify recipient addresses). Then, go to your Data Mart page, open the")}{' '}
          <strong>{t('destinationHelp.common.destinations', 'Destinations')}</strong>{' '}
          {t('destinationHelp.email.setupEnd', 'tab, and create a report in the Email block.')}
        </p>
        <p className='mb-2'>
          {t('destinationHelp.email.delivery', 'In the report settings, add a subject and message, and set the delivery conditions. The generated report will be delivered by P2PDigital Data Marts to the selected addresses as formatted text.')}
        </p>
        <p className='mb-2'>
          {t('destinationHelp.common.moreDetails', 'For more details, read the')}{' '}
          <ExternalAnchor
            className='underline'
            href='https://docs.p2pdigital.vn/docs/destinations/supported-destinations/email/?utm_source=owox_data_marts&utm_medium=destination_entity&utm_campaign=tooltip-email'
          >
            {t('destinationHelp.common.documentation', 'P2PDigital documentation')}
          </ExternalAnchor>
          .
        </p>
      </AccordionContent>
    </AccordionItem>
  );
}
