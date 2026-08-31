import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@owox/ui/components/dialog';
import { DataStorageDetails } from '../../../shared';
import type { DataStorage } from '../../../shared/model/types/data-storage.ts';
import { useTranslation } from 'react-i18next';

interface DataStorageDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dataStorage: DataStorage | null;
  isLoading?: boolean;
}

export function DataStorageDetailsDialog({
  isOpen,
  onClose,
  dataStorage,
  isLoading = false,
}: DataStorageDetailsDialogProps) {
  const { t } = useTranslation();

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dataStorageDetails.title', 'Storage Details')}</DialogTitle>
          <DialogDescription>
            {t('dataStorageDetails.description', 'View detailed information about this storage.')}
          </DialogDescription>
        </DialogHeader>
        <div className='py-4'>
          <DataStorageDetails dataStorage={dataStorage} isLoading={isLoading} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
