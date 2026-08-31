import { useProjectRoute } from '../../../../../../shared/hooks';
import { useTranslation } from 'react-i18next';
import { DataMartPlusIcon } from '../../../../../../shared';
import { GraduationCap, SquarePlay } from 'lucide-react';
import { dataMartPresetsList } from '../../../../shared/utils/data-mart-presets';
import { DataMartDefinitionType } from '../../../../shared';
import {
  EmptyStateCard,
  EmptyStateCardHeader,
  EmptyStateCardTitle,
  EmptyStateCardSubTitle,
  EmptyStateCardIllustration,
  EmptyStateCardContent,
  EmptyStateCardSection,
  EmptyStateCardSectionTitle,
  EmptyStateCardSectionContent,
  EmptyStateCardActionButton,
} from '../../../../../../shared/components/EmptyStateCard';

export function EmptyDataMartsState() {
  const { scope } = useProjectRoute();
  const { t } = useTranslation();
  const presetTitleKeys: Record<string, string> = {
    connector: 'dataMartPresets.otherConnector.title',
    sql: 'dataMartPresets.sqlQuery.title',
    table: 'dataMartPresets.existingTable.title',
    blank: 'dataMartPresets.blankDataMart.title',
  };

  // Split presets for visual grouping
  const connectorPresets = dataMartPresetsList.filter(
    p => p.definitionType === DataMartDefinitionType.CONNECTOR
  );

  const otherPresets = dataMartPresetsList.filter(
    p => p.definitionType !== DataMartDefinitionType.CONNECTOR
  );

  return (
    <EmptyStateCard>
      <EmptyStateCardIllustration>
        <DataMartPlusIcon
          className='animate-icon-entrance'
          aria-label={t('dataMartEmptyState.illustrationLabel', 'Data Mart creation illustration')}
        />
      </EmptyStateCardIllustration>

      <EmptyStateCardContent>
        <EmptyStateCardHeader>
          <EmptyStateCardTitle>
            {t('dataMartEmptyState.title', 'Let’s Build Your First Data Mart')}
          </EmptyStateCardTitle>
          <EmptyStateCardSubTitle>
            {t(
              'dataMartEmptyState.subtitle',
              'A Data Mart is the key element of self-service analytics — it provides both control for data analyst and freedom for business users. To get started, connect the source you need or query the data you already have in storage'
            )}
          </EmptyStateCardSubTitle>
        </EmptyStateCardHeader>

        {/* Connector-based section */}
        <EmptyStateCardSection>
          <EmptyStateCardSectionTitle>
            {t('dataMartEmptyState.connectSource', 'Connect a data source')}
          </EmptyStateCardSectionTitle>
          <EmptyStateCardSectionContent>
            {connectorPresets.map(preset => (
              <EmptyStateCardActionButton
                key={preset.key}
                href={scope(`/data-marts/create?preset=${preset.key}`)}
                icon={preset.icon && <preset.icon className='h-4 w-4' />}
                title={t(presetTitleKeys[preset.key] ?? preset.title, preset.title)}
                variant='outline'
              />
            ))}
          </EmptyStateCardSectionContent>
        </EmptyStateCardSection>

        {/* SQL-based and Blank */}
        <EmptyStateCardSection>
          <EmptyStateCardSectionTitle>
            {t(
              'dataMartEmptyState.otherOptions',
              'Use existing SQL, Table or start from scratch'
            )}
          </EmptyStateCardSectionTitle>
          <EmptyStateCardSectionContent>
            {otherPresets.map(preset => (
              <div className='flex items-center gap-4' key={preset.key}>
                <EmptyStateCardActionButton
                  href={scope(`/data-marts/create?preset=${preset.key}`)}
                  icon={preset.icon && <preset.icon className='h-4 w-4' />}
                  title={t(presetTitleKeys[preset.key] ?? preset.title, preset.title)}
                  variant='outline'
                />
              </div>
            ))}
          </EmptyStateCardSectionContent>
        </EmptyStateCardSection>

        {/* Help */}
        <EmptyStateCardSection separator={false}>
          <EmptyStateCardSectionContent>
            <EmptyStateCardActionButton
              href='https://www.youtube.com/playlist?list=PLvcNVLV5BVbHHCekyAZBEIVnlC4i1qcHx'
              icon={<SquarePlay className='h-4 w-4' />}
              title={t('dataMartEmptyState.watchDemo', 'Watch a 2-minute demo')}
              variant='ghost'
              target='_blank'
            />
            <EmptyStateCardActionButton
              href='https://docs.p2pdigital.io.vn/docs/getting-started/core-concepts/?utm_source=owox_data_marts&utm_medium=empty_data_marts_page&utm_campaign=help_buttons'
              icon={<GraduationCap className='h-4 w-4' />}
              title={t('dataMartEmptyState.coreConcepts', 'Core concepts')}
              variant='ghost'
              target='_blank'
            />
          </EmptyStateCardSectionContent>
        </EmptyStateCardSection>
      </EmptyStateCardContent>
    </EmptyStateCard>
  );
}
