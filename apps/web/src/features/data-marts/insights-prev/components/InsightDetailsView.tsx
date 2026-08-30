import { Link, useNavigate, useParams } from 'react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResizableColumns from '../../../../shared/components/ResizableColumns/ResizableColumns';
import InsightEditor from './InsightEditor.tsx';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@owox/ui/components/breadcrumb';
import { InlineEditTitle } from '../../../../shared/components/InlineEditTitle/InlineEditTitle.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@owox/ui/components/dropdown-menu';
import { Button } from '@owox/ui/components/button';
import { MoreVertical, Trash2, Bookmark, BookmarkX, Loader2, Send, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { useClipboard } from '../../../../hooks/useClipboard';
import { ConfirmationDialog } from '../../../../shared/components/ConfirmationDialog';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@owox/ui/components/empty';
import { useInsightForm, useInsightExecutionPolling } from '../hooks';
import { useDataMartContext } from '../../edit/model';
import {
  useMarkdownPreview,
  MarkdownEditorPreview,
} from '../../../../shared/components/MarkdownEditor';
import { useInsights } from '../model';
import { useInsightsPermissions } from '../hooks/useInsightsPermissions';
import { EmailReportEditSheet } from '../../reports/edit';
import { ReportFormMode, ReportsProvider } from '../../reports/shared';
import { DataDestinationType } from '../../../data-destination';
import { InsightLoader } from './InsightMinerLoader.tsx';
import RelativeTime from '@owox/ui/components/common/relative-time';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@owox/ui/components/tooltip';
import { formatDateShort, trackEvent } from '../../../../utils';
import { DataMartStatus } from '../../shared';

export default function InsightDetailsView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { insightId } = useParams<{ insightId: string }>();
  const storageKey = useMemo(() => 'insight_details_split', []);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { dataMart } = useDataMartContext();
  const isDraft = dataMart?.status.code === DataMartStatus.DRAFT;

  const {
    activeInsight: insight,
    insightLoading,
    isRunning,
    triggerId,
    updateInsight,
    updateInsightTitle,
    getInsight,
    runInsight,
    deleteInsight,
    resetTriggerId,
    ensureActiveRunPolling,
  } = useInsights();
  const { canEdit, canDelete, canRun, canSendAndSchedule } = useInsightsPermissions();

  const {
    handleSubmit,
    setValue,
    isTemplateDirty,
    isSubmitting,
    titleValue,
    templateValue,
    handleTitleUpdate,
    onSubmit,
  } = useInsightForm(insight, updateInsight, updateInsightTitle);

  const preview = useMarkdownPreview({
    markdown: insight?.output ?? '',
    enabled: !!insight?.output,
    debounceMs: 0,
  });

  // TODO:: Remove this toggle to show raw markdown output in read-only editor instead of HTML preview
  const [showRawOutput, setShowRawOutput] = useState(false);
  const [isReportSheetOpen, setIsReportSheetOpen] = useState(false);

  const { copyToClipboard } = useClipboard();

  const handleCopyOutput = useCallback(async () => {
    const text = insight?.output ?? '';
    if (!text) return;
    const ok = await copyToClipboard(text, 'insight-output');
    if (ok) {
      toast.success(t('insightsUi.copied'));
    } else {
      toast.error(t('insightsUi.copyFailed'));
    }
    trackEvent({
      event: 'insight_output_copied',
      category: 'Insights',
      action: 'Copy',
    });
  }, [insight?.output, copyToClipboard, t]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.shiftKey && (e.key === 'M' || e.key === 'm')) {
        e.preventDefault();
        setShowRawOutput(prev => !prev);
        trackEvent({
          event: 'insight_raw_output_toggle',
          category: 'Insights',
          action: 'ToggleRawOutput',
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleDelete = useCallback(async () => {
    if (!insight) return;
    await deleteInsight(insight.id);
    void navigate('..');
  }, [insight, deleteInsight, navigate]);

  const isOutputEmpty = !insightLoading && !insight?.output;

  useEffect(() => {
    if (!insightId) return;
    void getInsight(insightId);
  }, [insightId, getInsight]);

  useEffect(() => {
    if (insight?.id) {
      void ensureActiveRunPolling();
    }
  }, [insight?.id, ensureActiveRunPolling]);

  useInsightExecutionPolling({
    triggerId,
    dataMartId: dataMart?.id ?? '',
    insightId: insight?.id ?? '',
    onRunFinished: useCallback(() => {
      resetTriggerId();
      if (insight?.id) {
        void getInsight(insight.id);
      }
    }, [insight?.id, getInsight, resetTriggerId]),
    onError: useCallback(() => {
      resetTriggerId();
    }, [resetTriggerId]),
  });

  const handleRun = useCallback(async () => {
    if (!insight?.id) {
      console.error('Insight ID is not available');
      return;
    }
    try {
      await runInsight(insight.id);
    } catch (error) {
      console.error('Failed to run insight');
      throw error;
    }
  }, [insight?.id, runInsight]);

  const handleSaveAndRun = useCallback(
    () =>
      handleSubmit(async values => {
        await onSubmit(values);
        if (!insight?.id) {
          console.error('Insight ID is not available');
          return;
        }
        try {
          await runInsight(insight.id);
        } catch (error) {
          console.error('Failed to run insight');
          throw error;
        }
      })(),
    [handleSubmit, insight?.id, onSubmit, runInsight]
  );

  if (insightLoading) {
    // TODO:: Add skeleton loading indicator
    return <div className='text-muted-foreground flex flex-col gap-2 text-sm'>{t('common.loading')}</div>;
  }

  if (!insight || !dataMart) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <BookmarkX />
          </EmptyMedia>
        </EmptyHeader>
        <EmptyTitle>{t('insightsUi.notFound')}</EmptyTitle>
        <EmptyDescription>{t('insightsUi.notFoundDescription')}</EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className='flex h-full w-full flex-col gap-2'>
      <div className='flex items-center justify-between gap-2'>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to='..'>{t('insightsUi.insightPlural')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span aria-current='page' className='block max-w-[480px] truncate'>
                <InlineEditTitle
                  title={titleValue || t('insightsUi.untitled')}
                  onUpdate={handleTitleUpdate}
                  className='font-medium'
                  errorMessage={t('insightsUi.titleCannotEmpty')}
                  minWidth='200px'
                  readOnly={!canEdit}
                />
              </span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className='flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' aria-label={t('insightsUi.rowActions')}>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='w-full'>
                    <DropdownMenuItem
                      onClick={() => {
                        setIsDeleteOpen(true);
                      }}
                      className='text-destructive'
                      disabled={!canDelete}
                    >
                      <Trash2 className='h-4 w-4 text-red-600' />{' '}
                      <span className='text-red-600'>{t('insightsUi.deleteInsight')}</span>
                    </DropdownMenuItem>
                  </div>
                </TooltipTrigger>
                {!canDelete && <TooltipContent side='left'>{t('common.noPermission')}</TooltipContent>}
              </Tooltip>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='bg-background flex-1 rounded-md border'>
        <ResizableColumns
          storageKey={storageKey}
          initialRatio={0.5}
          left={
            <div className='flex h-full min-h-0 flex-col'>
              <div className='min-h-0 flex-1 overflow-hidden'>
                <InsightEditor
                  value={templateValue ?? ''}
                  onChange={v => {
                    setValue('template', v, { shouldDirty: true });
                  }}
                  height={'calc(100vh - 275px)'}
                  placeholder={t('insightsUi.editorPlaceholder')}
                  readOnly={isRunning || !canEdit}
                  excludeInsightId={insightId}
                />
              </div>
              <div className='flex items-center justify-between gap-4 border-t px-4 py-2'>
                <div className='flex items-center gap-2'>
                  {(() => {
                    if (isDraft) {
                      return (
                        <Tooltip delayDuration={150}>
                          <TooltipTrigger asChild>
                            <span className='inline-flex' tabIndex={0}>
                              <Button
                                variant='default'
                                size='default'
                                disabled={isSubmitting || isRunning || !canRun}
                                onClick={() => {
                                  if (isTemplateDirty) {
                                    void handleSubmit(async values => {
                                      await onSubmit(values);
                                    })();
                                  }
                                }}
                              >
                                {isTemplateDirty ? (
                                  <span className='inline-flex items-center gap-2'>
                                    <Bookmark /> {t('insightsUi.save')}
                                  </span>
                                ) : (
                                  <span className='inline-flex items-center gap-2'>
                                    <Bookmark /> {t('insightsUi.runInsight')}
                                  </span>
                                )}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side='top'>
                            {canRun ? (
                              <p>{t('insightsUi.publishBeforeRun')}</p>
                            ) : (
                              <p>{t('common.noPermission')}</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }
                    return (
                      <Tooltip delayDuration={150}>
                        <TooltipTrigger asChild>
                          <div className='inline-flex'>
                            <Button
                              variant='default'
                              size='default'
                              disabled={isSubmitting || isRunning || !canRun}
                              onClick={() =>
                                void (isTemplateDirty ? handleSaveAndRun() : handleRun())
                              }
                            >
                              {isRunning ? (
                                <span className='inline-flex items-center gap-2'>
                                  <Loader2 className='h-3 w-3 animate-spin' /> {t('insightsUi.running')}
                                </span>
                              ) : isTemplateDirty ? (
                                <span className='inline-flex items-center gap-2'>
                                  <Bookmark /> {t('insightsUi.saveAndRun')}
                                </span>
                              ) : (
                                <span className='inline-flex items-center gap-2'>
                                  <Bookmark /> {t('insightsUi.runInsight')}
                                </span>
                              )}
                            </Button>
                          </div>
                        </TooltipTrigger>
                        {!canRun && (
                          <TooltipContent side='top'>{t('common.noPermission')}</TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })()}
                  <Tooltip delayDuration={1500}>
                    <TooltipTrigger asChild>
                      {(() => {
                        return (
                          <span className='inline-flex' tabIndex={0}>
                            <Button
                              variant='outline'
                              size='default'
                              onClick={() => {
                                trackEvent({
                                  event: 'insight_send_schedule',
                                  category: 'Insights',
                                  action: 'SendSchedule',
                                  label: insightId,
                                });
                                if (!isDraft && canSendAndSchedule) setIsReportSheetOpen(true);
                              }}
                              disabled={isDraft || !canSendAndSchedule}
                              className='gap-2'
                            >
                              <Send className='text-muted-foreground h-4 w-4' />
                              {t('insightsUi.sendSchedule')}
                            </Button>
                          </span>
                        );
                      })()}
                    </TooltipTrigger>
                    <TooltipContent side='top'>
                      {(() => {
                        if (isDraft) {
                          return (
                            <p>
                              {t('insightsUi.scheduleAfterPublish')}
                            </p>
                          );
                        }
                        if (!canSendAndSchedule) {
                          return <p>{t('common.noPermission')}</p>;
                        }
                        return (
                          <p>
                            {t('insightsUi.scheduleDescription')}
                          </p>
                        );
                      })()}
                    </TooltipContent>
                  </Tooltip>
                </div>
                {insight.outputUpdatedAt && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className='text-muted-foreground/75 text-sm'>
                          <RelativeTime date={insight.outputUpdatedAt} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side='top'>
                        <p>{t('insightsUi.lastRun')} {formatDateShort(insight.outputUpdatedAt)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          }
          right={
            <div className='h-full'>
              {isRunning ? (
                <InsightLoader />
              ) : isOutputEmpty ? (
                <Empty className='h-full'>
                  <EmptyHeader>
                    <EmptyMedia variant='icon'>
                      <Bookmark />
                    </EmptyMedia>
                    <EmptyTitle>{t('insightsUi.readyToExplore')}</EmptyTitle>
                    <EmptyDescription>
                      {t('insightsUi.runToUncover')}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className='flex h-full min-h-0 flex-col gap-2'>
                  <div className='relative min-h-0 flex-1 overflow-hidden'>
                    {showRawOutput ? (
                      <InsightEditor
                        value={insight.output ?? ''}
                        onChange={() => {
                          // TODO:: Dont allow editing output in read-only mode. After rollout Insights feature should be removed
                        }}
                        height={'100%'}
                        className='h-full'
                        readOnly
                        excludeInsightId={insightId}
                      />
                    ) : preview.error ? (
                      <div className='text-destructive'>{preview.error}</div>
                    ) : (
                      <>
                        <MarkdownEditorPreview
                          html={preview.html}
                          loading={preview.loading}
                          error={preview.error}
                          height='100%'
                        />
                        {!!insight.output && !preview.loading && !preview.error && (
                          <div className='absolute top-2 right-2 z-10'>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant='outline'
                                    size='icon'
                                    className='h-8 w-8'
                                    aria-label={t('insightsUi.copyMarkdown')}
                                    onClick={() => void handleCopyOutput()}
                                  >
                                    <Copy className='h-4 w-4' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side='left'>
                                  <p>{t('insightsUi.copyMarkdown')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          }
        />
      </div>

      <ConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={t('insightsUi.deleteInsightTitle')}
        description={t('insightsUi.deleteInsightConfirm')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant='destructive'
        onConfirm={() => {
          void handleDelete();
        }}
      />

      <ReportsProvider>
        <EmailReportEditSheet
          isOpen={isReportSheetOpen}
          onClose={() => {
            setIsReportSheetOpen(false);
          }}
          mode={ReportFormMode.CREATE}
          isInsightContext={true}
          preSelectedDestination={null}
          prefill={{
            title: insight.title || titleValue || t('insightsUi.newReportPrefill'),
            subject: `Insight: ${insight.title || titleValue || ''}`.trim(),
            messageTemplate: templateValue ?? '',
          }}
          allowedDestinationTypes={[
            DataDestinationType.EMAIL,
            DataDestinationType.SLACK,
            DataDestinationType.MS_TEAMS,
            DataDestinationType.GOOGLE_CHAT,
          ]}
        />
      </ReportsProvider>
    </div>
  );
}
