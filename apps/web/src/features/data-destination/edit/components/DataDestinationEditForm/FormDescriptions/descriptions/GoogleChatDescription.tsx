import { AccordionItem, AccordionTrigger, AccordionContent } from '@owox/ui/components/accordion';
import { ExternalAnchor } from '@owox/ui/components/common/external-anchor';
import { useTranslation } from 'react-i18next';

export default function GoogleChatDescription() {
  const { t } = useTranslation();
  return (
    <AccordionItem value='googlechat-details'>
      <AccordionTrigger>{t('destinationHelp.googleChat.title', 'How do I start sending to Google Chat?')}</AccordionTrigger>
      <AccordionContent>
        <p className='mb-2'>
          {t('destinationHelp.googleChat.choose', 'Choose')}{' '}
          <strong>{t('googleChat.incomingWebhook', 'Incoming Webhook')}</strong>{' '}
          {t('destinationHelp.googleChat.webhookText', 'to send the report directly to the space as formatted Google Chat messages, or')}{' '}
          <strong>{t('googleChat.channelEmail', 'Channel Email')}</strong>{' '}
          {t('destinationHelp.googleChat.emailText', 'to send it by email to the Chat space address. For webhook delivery, open')}{' '}
          <strong>Apps &amp; integrations</strong>{' '}
          {t('destinationHelp.googleChat.appsText', 'in the target space, add an incoming webhook, and paste its URL here. Treat the URL as a secret.')}
        </p>
        <p className='mb-2'>
          {t('destinationHelp.googleChat.reportSetup', "Then create a report from your Data Mart's")}{' '}
          <strong>{t('destinationHelp.common.destinations', 'Destinations')}</strong>{' '}
          {t('destinationHelp.googleChat.reportSetupEnd', 'tab and configure its subject, message, and delivery conditions.')}
        </p>
        <p className='mb-2'>
          {t('destinationHelp.common.moreDetails', 'For more details, read the')}{' '}
          <ExternalAnchor
            className='underline'
            href='https://docs.p2pdigital.io.vn/docs/destinations/supported-destinations/google-chat/?utm_source=owox_data_marts&utm_medium=destination_entity&utm_campaign=tooltip-google-chat'
          >
            {t('destinationHelp.common.documentation', 'P2PDigital documentation')}
          </ExternalAnchor>
          .
        </p>
      </AccordionContent>
    </AccordionItem>
  );
}
