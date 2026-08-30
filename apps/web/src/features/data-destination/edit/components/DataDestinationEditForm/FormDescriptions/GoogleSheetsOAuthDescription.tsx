import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@owox/ui/components/accordion';
import { useTranslation } from 'react-i18next';

/**
 * Accordion with details about Google OAuth permissions requested for Google Sheets access.
 */
export default function GoogleSheetsOAuthDescription() {
  const { t } = useTranslation();
  return (
    <Accordion variant='common' type='single' collapsible>
      <AccordionItem value='oauth-details'>
        <AccordionTrigger>
          {t('destinationHelp.googleSheetsOAuth.title', 'What permissions will be requested?')}
        </AccordionTrigger>
        <AccordionContent>
          <p className='mb-2'>
            {t(
              'destinationHelp.googleSheetsOAuth.intro',
              'When you connect with Google, P2PDigital will request the following permissions:'
            )}
          </p>
          <ul className='list-inside list-disc space-y-2 text-sm'>
            <li>
              <strong>Google Sheets</strong>{' '}
              {t(
                'destinationHelp.googleSheetsOAuth.sheetsPermission',
                '— read and write access to spreadsheets used as data destinations.'
              )}
            </li>
            <li>
              <strong>{t('destinationHelp.googleSheetsOAuth.profileLabel', 'Basic profile info')}</strong>{' '}
              {t(
                'destinationHelp.googleSheetsOAuth.profilePermission',
                '— your name and email to identify the connected account.'
              )}
            </li>
          </ul>
          <p className='mt-2 text-sm'>
            {t(
              'destinationHelp.googleSheetsOAuth.revokeIntro',
              'P2PDigital will only access spreadsheets that you explicitly configure as destinations. You can revoke access at any time from your'
            )}{' '}
            <a
              href='https://myaccount.google.com/permissions'
              target='_blank'
              rel='noopener noreferrer'
              className='underline'
            >
              {t('destinationHelp.googleSheetsOAuth.accountSettings', 'Google Account settings')}
            </a>
            .
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
