import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@owox/ui/components/sheet';
import type { ConnectorDefinitionConfig } from '../../../../data-marts/edit/model';
import { ConnectorRunForm } from './ConnectorRunForm';
import type { ConnectorRunFormData } from '../../../shared/model/types/connector';
import { useIntercomLauncher } from '../../../../../shared/hooks/useIntercomLauncher';
import { useTranslation } from 'react-i18next';

interface ConnectorRunSheetProps {
  isOpen: boolean;
  onClose: () => void;
  configuration: ConnectorDefinitionConfig | null;
  onSubmit: (data: ConnectorRunFormData) => void;
}

export function ConnectorRunSheet({
  isOpen,
  onClose,
  configuration,
  onSubmit,
}: ConnectorRunSheetProps) {
  const { t } = useTranslation();
  useIntercomLauncher(isOpen);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('connectorRun.manualRun')}</SheetTitle>
        </SheetHeader>
        <ConnectorRunForm configuration={configuration} onClose={onClose} onSubmit={onSubmit} />
      </SheetContent>
    </Sheet>
  );
}
