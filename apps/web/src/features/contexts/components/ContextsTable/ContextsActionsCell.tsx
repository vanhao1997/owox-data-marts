import { Button } from '@owox/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@owox/ui/components/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminGuardTooltip } from '../../../../shared/components/AdminGuardTooltip';

interface ContextsActionsCellProps {
  contextId: string;
  isAdmin: boolean;
  onEdit?: (contextId: string) => void;
  onDelete?: (contextId: string) => void;
}

export const ContextsActionsCell: FC<ContextsActionsCellProps> = ({
  contextId,
  isAdmin,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const adminOnlyHint = t('contextsPage.adminOnlyHint');

  return (
    <div className='actions-cell text-right'>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className={`dm-card-table-body-row-actionbtn opacity-0 transition-opacity ${
              isMenuOpen ? 'opacity-100' : 'group-hover:opacity-100'
            }`}
            aria-label={t('common.openMenu')}
          >
            <MoreHorizontal className='dm-card-table-body-row-actionbtn-icon' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <AdminGuardTooltip isAdmin={isAdmin} hint={adminOnlyHint}>
            <DropdownMenuItem
              disabled={!isAdmin}
              onClick={() => {
                if (!isAdmin) return;
                onEdit?.(contextId);
              }}
            >
              <Pencil className='text-foreground h-4 w-4' aria-hidden='true' />
              <span>{t('common.edit')}</span>
            </DropdownMenuItem>
          </AdminGuardTooltip>
          <DropdownMenuSeparator />
          <AdminGuardTooltip isAdmin={isAdmin} hint={adminOnlyHint}>
            <DropdownMenuItem
              disabled={!isAdmin}
              onClick={() => {
                if (!isAdmin) return;
                onDelete?.(contextId);
              }}
            >
              <Trash2 className='h-4 w-4 text-red-600' aria-hidden='true' />
              <span className='text-red-600'>{t('common.delete')}</span>
            </DropdownMenuItem>
          </AdminGuardTooltip>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
