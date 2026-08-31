import { AccordionItem, AccordionTrigger, AccordionContent } from '@owox/ui/components/accordion';
import { ExternalAnchor } from '@owox/ui/components/common/external-anchor';
import { useTranslation } from 'react-i18next';

export default function SlackDescription() {
  const { t } = useTranslation();
  return (
    <AccordionItem value='slack-details'>
      <AccordionTrigger>{t('destinationHelp.slack.title', 'How do I start sending to Slack?')}</AccordionTrigger>
      <AccordionContent>
        <p className='mb-2'>
          {t('destinationHelp.slack.setup', 'To send reports to Slack, first configure the')}{' '}
          <strong>Slack</strong>{' '}
          {t('destinationHelp.slack.setupAfterSlack', "destination in this form (add a title and specify recipient addresses). Then, go to your Data Mart page, open the")}{' '}
          <strong>{t('destinationHelp.common.destinations', 'Destinations')}</strong>{' '}
          {t('destinationHelp.slack.setupEnd', 'tab, and create a report in the Slack block.')}
        </p>
        <p className='mb-2'>
          {t('destinationHelp.slack.delivery', 'In the report settings, add a subject and message, and set the delivery conditions. The generated report will be delivered by P2PDigital Data Marts to the selected channel as a message.')}
        </p>
        <p className='mb-2'>
          {t('destinationHelp.common.moreDetails', 'For more details, read the')}{' '}
          <ExternalAnchor
            className='underline'
            href='https://docs.p2pdigital.io.vn/docs/destinations/supported-destinations/slack/?utm_source=owox_data_marts&utm_medium=destination_entity&utm_campaign=tooltip-slack'
          >
            {t('destinationHelp.common.documentation', 'P2PDigital documentation')}
          </ExternalAnchor>
          .
        </p>
      </AccordionContent>
    </AccordionItem>
  );
}
