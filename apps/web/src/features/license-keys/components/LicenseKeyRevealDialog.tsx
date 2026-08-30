import { SecretRevealDialog } from '../../../shared/components/SecretRevealDialog/SecretRevealDialog';
import { useTranslation } from 'react-i18next';
import type { CreateLicenseKeyResponse } from '../types';

interface LicenseKeyRevealDialogProps {
  data: CreateLicenseKeyResponse | null;
  onDone: () => void;
}

export function LicenseKeyRevealDialog({ data, onDone }: LicenseKeyRevealDialogProps) {
  const { t } = useTranslation();
  if (!data) return null;

  return (
    <SecretRevealDialog
      title={t('licenseKeysPage.revealTitle')}
      description={
        <>
          {t('licenseKeysPage.revealDescriptionPrefix')} <code>LICENSE_KEY</code>{' '}
          {t('licenseKeysPage.revealDescriptionMiddle')} <strong>{data.origin}</strong>.
        </>
      }
      label={t('licenseKeysPage.keyLabel')}
      labelTooltip={t('licenseKeysPage.keyTooltip')}
      secret={data.licenseKey}
      notice={t('licenseKeysPage.revealNotice')}
      confirmLabel={t('licenseKeysPage.revealConfirm')}
      onDone={onDone}
    />
  );
}
