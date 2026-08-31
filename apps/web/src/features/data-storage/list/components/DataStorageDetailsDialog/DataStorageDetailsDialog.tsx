import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@owox/ui/components/dialog';
import { DataStorageDetails } from '../../../shared';
import { useDataStorage } from '../../../shared/model/hooks/useDataStorage';
import { useTranslation } from 'react-i18next';

interface DataStorageDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
}

export function DataStorageDetailsDialog({ isOpen, onClose, id }: DataStorageDetailsDialogProps) {
  const { t } = useTranslation();
  const { getDataStorageById, currentDataStorage, loading, clearCurrentDataStorage } =
    useDataStorage();

  useEffect(() => {
    if (isOpen && id) {
      // The hook keeps the error in context; this effect must consume the
      // rejection because the dialog has no async caller to handle it.
      void getDataStorageById(id).catch(() => undefined);
    }

    return () => {
      if (!isOpen) {
        clearCurrentDataStorage();
      }
    };
  }, [isOpen, id, getDataStorageById, clearCurrentDataStorage]);

  const handleClose = () => {
    clearCurrentDataStorage();
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
          <DataStorageDetails dataStorage={currentDataStorage} isLoading={loading} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
