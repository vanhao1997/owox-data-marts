import { useSidebar } from '@owox/ui/components/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@owox/ui/components/tooltip';
import { CircularProgress } from './CircularProgress';
import { useTranslation } from 'react-i18next';

interface SetupChecklistCollapsedProps {
  percentage: number;
  completedCount: number;
  totalCount: number;
}

export function SetupChecklistCollapsed({
  percentage,
  completedCount,
  totalCount,
}: SetupChecklistCollapsedProps) {
  const { toggleSidebar } = useSidebar();
  const { t } = useTranslation();

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <button
          type='button'
          onClick={toggleSidebar}
          className='hover:bg-sidebar-accent mx-auto flex size-8 items-center justify-center rounded-md transition-colors'
          aria-label={t('setupChecklist.progressAria', {
            completed: completedCount,
            total: totalCount,
          })}
        >
          <CircularProgress percentage={percentage} size={20} />
        </button>
      </TooltipTrigger>
      <TooltipContent side='right'>
        {t('setupChecklist.progressTooltip', { percentage })}
      </TooltipContent>
    </Tooltip>
  );
}
