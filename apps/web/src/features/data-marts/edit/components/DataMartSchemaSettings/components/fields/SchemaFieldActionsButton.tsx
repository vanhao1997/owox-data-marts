import { Button } from '@owox/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@owox/ui/components/dropdown-menu';
import { type Row } from '@tanstack/react-table';
import { Eye, EyeOff, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '../../../../../../../shared/components/ConfirmationDialog';

/**
 * Props for the SchemaFieldActionsButton component
 */
interface SchemaFieldActionsButtonProps<TData> {
  /** Row data for row-specific actions */
  row: Row<TData>;
  /** Callback function to delete a row */
  onDeleteRow?: (index: number) => void;
  /** Callback function to add a nested field to a record type */
  onAddNestedField?: (index: number) => void;
  /** Function to check if a field is a record type */
  isRecordType?: (index: number) => boolean;
  /** Whether the field is currently hidden from reports */
  isHiddenForReporting?: boolean;
  /** Callback to toggle the hidden-for-reporting state */
  onToggleHiddenForReporting?: (index: number) => void;
}

/**
 * Component that provides a dropdown menu for schema field row actions
 */
export function SchemaFieldActionsButton<TData>({
  row,
  onDeleteRow,
  onAddNestedField,
  isRecordType,
  isHiddenForReporting,
  onToggleHiddenForReporting,
}: SchemaFieldActionsButtonProps<TData>) {
  const { t } = useTranslation();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleDeleteConfirm = () => {
    if (onDeleteRow) {
      onDeleteRow(row.index);
    }
    setIsDeleteConfirmOpen(false);
  };

  const showAddNestedField = isRecordType && onAddNestedField && isRecordType(row.index);
  const showHideToggle = !!onToggleHiddenForReporting;
  const showDeleteField = !!onDeleteRow;
  const showSeparator = (Boolean(showAddNestedField) || showHideToggle) && showDeleteField;

  return (
    <div className='px-3 text-right'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='dm-card-table-body-row-actionbtn opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100'
            aria-label={t('common.actions')}
          >
            <MoreHorizontal className='dm-card-table-body-row-actionbtn-icon' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {showAddNestedField && (
            <DropdownMenuItem
              className='cursor-pointer'
              onClick={() => {
                onAddNestedField(row.index);
              }}
            >
              <Plus className='mr-2 h-4 w-4' />
              {t('schemaSettings.addNestedField')}
            </DropdownMenuItem>
          )}

          {onToggleHiddenForReporting && (
            <DropdownMenuItem
              className='cursor-pointer'
              onClick={() => {
                onToggleHiddenForReporting(row.index);
              }}
            >
              {isHiddenForReporting ? (
                <>
                  <Eye className='mr-2 h-4 w-4' />
                  {t('schemaSettings.showInReports')}
                </>
              ) : (
                <>
                  <EyeOff className='mr-2 h-4 w-4' />
                  {t('schemaSettings.hideFromReports')}
                </>
              )}
            </DropdownMenuItem>
          )}

          {showSeparator && <DropdownMenuSeparator />}

          {showDeleteField && (
            <DropdownMenuItem
              onClick={() => {
                setIsDeleteConfirmOpen(true);
              }}
            >
              <Trash2 className='h-4 w-4 text-red-600' aria-hidden='true' />
              <span className='text-red-600'>{t('schemaSettings.deleteField')}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title={t('schemaSettings.deleteField')}
        description={t('schemaSettings.deleteFieldConfirm')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDeleteConfirm}
        variant='destructive'
      />
    </div>
  );
}
