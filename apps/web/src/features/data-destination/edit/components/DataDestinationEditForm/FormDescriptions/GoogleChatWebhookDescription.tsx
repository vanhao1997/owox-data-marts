import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@owox/ui/components/accordion';
import { ExternalAnchor } from '@owox/ui/components/common/external-anchor';
import { useTranslation } from 'react-i18next';

export default function GoogleChatWebhookDescription() {
  const { t } = useTranslation();
  return (
    <Accordion variant='common' type='single' collapsible>
      <AccordionItem value='google-chat-webhook-details'>
        <AccordionTrigger>{t('googleChat.webhookDescription.title', 'How do I get an incoming webhook URL?')}</AccordionTrigger>
        <AccordionContent>
          <ol className='list-inside list-decimal space-y-2 text-sm'>
            <li>{t('googleChat.webhookDescription.openSpace', 'Open the target space in Google Chat on a computer.')}</li>
            <li>
              {t('googleChat.webhookDescription.appsIntegrations', 'Click the space name, then select Apps & integrations.')}
            </li>
            <li>
              {t('googleChat.webhookDescription.addWebhooks', 'Click Add webhooks, enter a name, and save the webhook.')}
            </li>
            <li>
              {t('googleChat.webhookDescription.copyLink', "Open the webhook's menu, select Copy link, and paste the URL above.")}
            </li>
          </ol>
          <p className='mt-2 text-sm'>
            {t('googleChat.webhookDescription.warning', 'If you cannot add a webhook, your Google Workspace administrator might have disabled this option. Keep the webhook URL secret.')}
          </p>
          <p className='mt-2 text-sm'>
            {t('googleChat.webhookDescription.seeGuide', 'See the')} {' '}
            <ExternalAnchor href='https://developers.google.com/workspace/chat/quickstart/webhooks'>
              {t('googleChat.webhookDescription.guide', 'Google Chat webhook guide')}
            </ExternalAnchor>{' '}
            {t('googleChat.webhookDescription.forDetails', 'for more details.')}
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
