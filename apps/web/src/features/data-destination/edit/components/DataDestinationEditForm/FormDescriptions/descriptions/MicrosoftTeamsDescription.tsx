import { AccordionItem, AccordionTrigger, AccordionContent } from '@owox/ui/components/accordion';
import { ExternalAnchor } from '@owox/ui/components/common/external-anchor';
import { useTranslation } from 'react-i18next';

export default function MicrosoftTeamsDescription() {
  const { t } = useTranslation();
  return (
    <AccordionItem value='msteams-details'>
      <AccordionTrigger>{t('destinationHelp.microsoftTeams.title', 'How do I start sending to Microsoft Teams?')}</AccordionTrigger>
      <AccordionContent>
        <p className='mb-2'>
          {t('destinationHelp.microsoftTeams.setup', 'To send reports to Microsoft Teams, first configure the')}{' '}
          <strong>Microsoft Teams</strong>{' '}
          {t('destinationHelp.microsoftTeams.setupAfterTeams', "destination in this form (add a title and specify recipient addresses). Then, go to your Data Mart page, open the")}{' '}
          <strong>{t('destinationHelp.common.destinations', 'Destinations')}</strong>{' '}
          {t('destinationHelp.microsoftTeams.setupEnd', 'tab, and create a report in the Microsoft Teams block.')}
        </p>
        <p className='mb-2'>
          {t('destinationHelp.microsoftTeams.delivery', 'In the report settings, add a subject and message, and set the delivery conditions. The generated report will be delivered by P2PDigital Data Marts to the selected channel as a message.')}
        </p>
        <p className='mb-2'>
          {t('destinationHelp.common.moreDetails', 'For more details, read the')}{' '}
          <ExternalAnchor
            className='underline'
            href='https://docs.p2pdigital.vn/docs/destinations/supported-destinations/microsoft-teams/?utm_source=owox_data_marts&utm_medium=destination_entity&utm_campaign=tooltip-microsoft-teams'
          >
            {t('destinationHelp.common.documentation', 'P2PDigital documentation')}
          </ExternalAnchor>
          .
        </p>
      </AccordionContent>
    </AccordionItem>
  );
}
