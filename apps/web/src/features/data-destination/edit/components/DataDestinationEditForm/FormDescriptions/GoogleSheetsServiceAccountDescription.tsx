import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@owox/ui/components/accordion';
import { ExternalAnchor } from '@owox/ui/components/common/external-anchor';
import { useTranslation } from 'react-i18next';

/**
 * Accordion with step-by-step instructions for obtaining a Google Service Account JSON key.
 */
export default function GoogleSheetsServiceAccountDescription() {
  const { t } = useTranslation();
  return (
    <Accordion variant='common' type='single' collapsible>
      <AccordionItem value='service-account-details'>
        <AccordionTrigger>
          {t('destinationHelp.googleSheetsServiceAccount.title', 'How do I get a Service Account JSON key?')}
        </AccordionTrigger>
        <AccordionContent>
          <p className='mb-2'>
            {t(
              'destinationHelp.googleSheetsServiceAccount.intro',
              "To get the JSON key, you'll need to create or use an existing service account in Google Cloud."
            )}
          </p>
          <p className='mb-2'>
            {t('destinationHelp.googleSheetsServiceAccount.stepsIntro', "Here's what to do:")}
          </p>
          <ol className='list-inside list-decimal space-y-2 text-sm'>
            <li>
              {t('destinationHelp.googleSheetsServiceAccount.goTo', 'Go to')}{' '}
              <ExternalAnchor href='https://console.cloud.google.com/iam-admin/serviceaccounts'>
                {t('destinationHelp.googleSheetsServiceAccount.console', 'Google Cloud Console')}
              </ExternalAnchor>{' '}
              .
            </li>
            <li>
              {t('destinationHelp.googleSheetsServiceAccount.openIam', 'Open')}{' '}
              <strong>{t('destinationHelp.googleSheetsServiceAccount.iamPath', 'IAM & Admin → Service Accounts')}</strong>.
            </li>
            <li>{t('destinationHelp.googleSheetsServiceAccount.createOrSelect', 'Create a new service account or select an existing one.')}</li>
            <li>
              {t('destinationHelp.googleSheetsServiceAccount.openKeys', 'Open the Service Accounts page, go to the')}{' '}
              <strong>{t('destinationHelp.googleSheetsServiceAccount.keys', 'Keys')}</strong>{' '}
              {t('destinationHelp.googleSheetsServiceAccount.click', 'tab, click')}{' '}
              <strong>{t('destinationHelp.googleSheetsServiceAccount.addKey', 'Add key')}</strong>,{' '}
              {t('destinationHelp.googleSheetsServiceAccount.selectCreate', 'and select')}{' '}
              <strong>{t('destinationHelp.googleSheetsServiceAccount.createKey', 'Create new key')}</strong>.
            </li>
            <li>
              {t('destinationHelp.googleSheetsServiceAccount.choose', 'Choose')}{' '}
              <strong>JSON</strong>{' '}
              {t('destinationHelp.googleSheetsServiceAccount.formatAndClick', 'format and click')}{' '}
              <strong>{t('destinationHelp.googleSheetsServiceAccount.create', 'Create')}</strong>.
            </li>
            <li>
              {t('destinationHelp.googleSheetsServiceAccount.paste', 'Open the downloaded file, copy its entire content, and paste it into the field above.')}
            </li>
          </ol>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
