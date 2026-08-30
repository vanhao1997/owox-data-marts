import { FormSection } from '@owox/ui/components/form';
import type { NotificationSettingsItem } from '../../../types';
import { TitleField } from './TitleField';
import { EnabledField } from './EnabledField';
import { useTranslation } from 'react-i18next';

interface GeneralSectionProps {
  setting: NotificationSettingsItem;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  disabled?: boolean;
}

export function GeneralSection({
  setting,
  enabled,
  onEnabledChange,
  disabled,
}: GeneralSectionProps) {
  const { t } = useTranslation();
  return (
    <FormSection title={t('common.general', 'General')}>
      <TitleField title={setting.title} />
      <EnabledField enabled={enabled} onChange={onEnabledChange} disabled={disabled} />
    </FormSection>
  );
}
