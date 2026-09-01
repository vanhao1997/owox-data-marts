import { Plus, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@owox/ui/components/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@owox/ui/components/tooltip';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@owox/ui/components/empty';
import { useInsights } from '../model';
import { useInsightsPermissions } from '../hooks/useInsightsPermissions';

/**
 * Empty state component for insights.
 * @constructor
 */
export const InsightsEmptyState = () => {
  const { t } = useTranslation();
  const { handleCreateInsight, handleCreateInsightWithAi, insightLoading } = useInsights();
  const { canCreate, canGenerateAI } = useInsightsPermissions(true);

  return (
    <Empty>
      <EmptyHeader className='max-w-xl'>
        <EmptyMedia variant='icon'>
          <Sparkles />
        </EmptyMedia>
        <EmptyTitle>{t('insightsUi.firstInsightTitle')}</EmptyTitle>
        <EmptyDescription>{t('insightsUi.firstInsightDescription')}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className='max-w-xl'>
        <div className='flex w-full items-center justify-center gap-4'>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='inline-flex'>
                <Button
                  onClick={() => void handleCreateInsightWithAi()}
                  disabled={insightLoading || !canGenerateAI}
                >
                  <Sparkles className='h-4 w-4' />
                  {t('insightsUi.generateWithAi')}
                </Button>
              </div>
            </TooltipTrigger>
            {!canGenerateAI && <TooltipContent>{t('common.noPermission')}</TooltipContent>}
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='inline-flex'>
                <Button
                  variant='outline'
                  onClick={() => void handleCreateInsight()}
                  disabled={insightLoading || !canCreate}
                >
                  <Plus className='h-4 w-4' />
                  {t('insightsUi.blankInsight')}
                </Button>
              </div>
            </TooltipTrigger>
            {!canCreate && <TooltipContent>{t('common.noPermission')}</TooltipContent>}
          </Tooltip>
        </div>
      </EmptyContent>
    </Empty>
  );
};

export default InsightsEmptyState;
