import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@owox/ui/components/accordion';
import { ExternalAnchor } from '@owox/ui/components/common/external-anchor';
import { useTranslation } from 'react-i18next';

export default function GoogleChatChannelEmailDescription() {
  const { t } = useTranslation();
  return (
    <Accordion variant='common' type='single' collapsible>
      <AccordionItem value='google-chat-channel-email-details'>
        <AccordionTrigger>{t('googleChat.channelEmailDescription.title', 'How do I get a Google Chat space email address?')}</AccordionTrigger>
        <AccordionContent>
          <ol className='list-inside list-decimal space-y-2 text-sm'>
            <li>{t('googleChat.channelEmailDescription.openSpace', 'Open the target space in Google Chat on a computer.')}</li>
            <li>
              {t('googleChat.channelEmailDescription.spaceSettings', 'Click the space name, then select Space settings.')}
            </li>
            <li>
              {t('googleChat.channelEmailDescription.generateEmail', 'Under Email, click Generate email if the space does not have an address yet.')}
            </li>
            <li>{t('googleChat.channelEmailDescription.copyAddress', 'Copy the space email address and paste it above.')}</li>
          </ol>
          <p className='mt-2 text-sm'>{t('googleChat.channelEmailDescription.managersOnly', 'Only space managers can generate the email address.')}</p>
          <p className='mt-2 text-sm'>
            {t('googleChat.channelEmailDescription.seeGuide', 'See the')} {' '}
            <ExternalAnchor href='https://support.google.com/chat/answer/14929313'>
              {t('googleChat.channelEmailDescription.guide', 'Google Chat email guide')}
            </ExternalAnchor>{' '}
            {t('googleChat.channelEmailDescription.forDetails', 'for more details.')}
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
