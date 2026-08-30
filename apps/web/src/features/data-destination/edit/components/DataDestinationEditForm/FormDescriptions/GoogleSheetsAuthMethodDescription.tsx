import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@owox/ui/components/accordion';
import { useTranslation } from 'react-i18next';

/**
 * Accordion with a brief explanation of the available Google Sheets authentication methods.
 */
export default function GoogleSheetsAuthMethodDescription() {
  const { t } = useTranslation();
  return (
    <Accordion variant='common' type='single' collapsible>
      <AccordionItem value='google-sheets-auth-method-details'>
        <AccordionTrigger>
          {t('destinationHelp.googleSheetsAuth.title', 'Which authentication method should I choose?')}
        </AccordionTrigger>
        <AccordionContent>
          <p className='mb-2'>
            {t('destinationHelp.googleSheetsAuth.intro', 'Google Sheets supports two authentication methods:')}
          </p>
          <div className='space-y-3 text-sm'>
            <div>
              <strong className='font-medium'>
                {t('destinationHelp.googleSheetsAuth.oauthLabel', 'Connect with Google (OAuth):')}
              </strong>
              <p className='mt-1'>
                {t(
                  'destinationHelp.googleSheetsAuth.oauthText',
                  'The quickest way to get started. Sign in with your Google account and grant access to Google Sheets in a few clicks. Best for most users.'
                )}
              </p>
            </div>
            <div>
              <strong className='font-medium'>
                {t('destinationHelp.googleSheetsAuth.serviceAccountLabel', 'Service Account JSON:')}
              </strong>
              <p className='mt-1'>
                {t(
                  'destinationHelp.googleSheetsAuth.serviceAccountText',
                  'Uses a Google Cloud service account key for server-to-server authentication. Recommended when you need unattended access without a personal Google account, or when your organization requires service accounts for compliance.'
                )}
              </p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
