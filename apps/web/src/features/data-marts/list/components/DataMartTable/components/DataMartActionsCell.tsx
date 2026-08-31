import { Button } from '@owox/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@owox/ui/components/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { ConfirmationDialog } from '../../../../../../shared/components/ConfirmationDialog';
import { useProjectRoute } from '../../../../../../shared/hooks';
import { DataStorageType } from '../../../../../data-storage';
import type { DataMartListItem } from '../../../model/types';
import { useTranslation } from 'react-i18next';

interface DataMartActionsCellProps {
  row: { original: DataMartListItem };
  deleteDataMart: (id: string) => Promise<void>;
  refreshList: () => Promise<void>;
}

export const DataMartActionsCell = ({
  row,
  deleteDataMart,
  refreshList,
}: DataMartActionsCellProps) => {
  const { t } = useTranslation();
  const { scope } = useProjectRoute();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleDelete = async () => {
    try {
      await deleteDataMart(row.original.id);
      setIsDeleteDialogOpen(false);
      await refreshList();
    } catch (error) {
      console.error('Failed to delete data mart:', error);
    }
  };

  return (
    <div className='text-right'>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className={`dm-card-table-body-row-actionbtn opacity-0 transition-opacity ${isMenuOpen ? 'opacity-100' : 'group-hover:opacity-100'}`}
            aria-label={t('common.openMenu', 'Open menu')}
          >
            <MoreHorizontal className='dm-card-table-body-row-actionbtn-icon' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem>
            <Link
              to={scope(`/data-marts/${row.original.id}/data-setup`)}
              className='flex gap-2 text-left'
            >
              <Pencil className='text-foreground h-4 w-4' aria-hidden='true' />
              <span>{t('common.edit', 'Edit')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className='h-4 w-4 text-red-600' aria-hidden='true' />
            <span className='text-red-600'>{t('common.delete', 'Delete')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={t('common.deleteDataMart', 'Delete Data Mart')}
        description={
          <div className='mt-2 space-y-3'>
            <p className='break-words'>
              {t('common.deleteDataMartDescription', 'Are you sure you want to delete "{{title}}"? This action cannot be undone.', { title: row.original.title })}
            </p>

            {row.original.storageType === DataStorageType.LEGACY_GOOGLE_BIGQUERY && (
              <p className='text-destructive text-sm'>
                {t('common.legacyDataMartWarning', 'Deleting this data mart will also make it unavailable in the Google Sheets extension.')}
              </p>
            )}
          </div>
        }
        confirmLabel={t('common.delete', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        onConfirm={() => void handleDelete()}
        variant='destructive'
      />
    </div>
  );
};
