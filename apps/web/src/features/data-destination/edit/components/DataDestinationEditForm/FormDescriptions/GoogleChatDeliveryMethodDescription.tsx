import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@owox/ui/components/accordion';
import { useTranslation } from 'react-i18next';

export default function GoogleChatDeliveryMethodDescription({
  deliveryMethod,
}: {
  deliveryMethod: 'webhook' | 'email';
}) {
  const { t } = useTranslation();
  const isWebhook = deliveryMethod === 'webhook';

  return (
    <Accordion variant='common' type='single' collapsible>
      <AccordionItem value='google-chat-delivery-method-details'>
        <AccordionTrigger>
          {isWebhook
            ? t('googleChat.deliveryMethodDescription.webhookTitle', 'How does Incoming Webhook delivery work?')
            : t('googleChat.deliveryMethodDescription.emailTitle', 'How does Channel Email delivery work?')}
        </AccordionTrigger>
        <AccordionContent>
          <p className='text-sm'>
            {isWebhook
              ? t('googleChat.deliveryMethodDescription.webhookText', 'Sends the report directly to the space as formatted Google Chat messages.')
              : t('googleChat.deliveryMethodDescription.emailText', 'Sends the report by email to the Google Chat space address. The report appears as an email card in the space.')}
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
