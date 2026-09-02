import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@owox/ui/components/sheet';
import { useCallback } from 'react';
import { UnsavedChangesConfirmationDialog } from '../../../../../../shared/components/UnsavedChangesConfirmationDialog';
import { DataDestinationProvider } from '../../../../../data-destination';
import type { DataDestination } from '../../../../../data-destination';
import { ReportFormMode, TemplateSourceTypeEnum } from '../../../shared';
import type { DataMartReport } from '../../../shared/model/types/data-mart-report';
import { EmailReportEditForm } from '../EmailReportEditForm/EmailReportEditForm';
import type { DataDestinationType } from '../../../../../data-destination';
import { toast } from 'sonner';
import { Link, useLocation, useParams } from 'react-router';
import { useUnsavedGuard } from '../../../../../../hooks/useUnsavedGuard';
import { useIntercomLauncher } from '../../../../../../shared/hooks/useIntercomLauncher';
import { ReportSheetDescription } from '../ReportSheetDescription';
import { useTranslation } from 'react-i18next';

interface EmailReportEditSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void | Promise<void>;
  initialReport?: DataMartReport;
  mode: ReportFormMode;
  preSelectedDestination?: DataDestination | null;
  prefill?: {
    title?: string;
    subject?: string;
    messageTemplate?: string;
    insightTemplateId?: string;
    templateSourceType?: TemplateSourceTypeEnum;
  };
  allowedDestinationTypes?: DataDestinationType[];
  isInsightContext?: boolean;
  isReadOnly?: boolean;
}

export function EmailReportEditSheet({
  isOpen,
  onClose,
  onSubmitSuccess,
  initialReport,
  mode,
  preSelectedDestination,
  prefill,
  allowedDestinationTypes,
  isInsightContext = false,
  isReadOnly = false,
}: EmailReportEditSheetProps) {
  const { t } = useTranslation();
  const { projectId, id: dataMartId } = useParams<{ projectId: string; id: string }>();
  const { pathname } = useLocation();
  const {
    showUnsavedDialog,
    setShowUnsavedDialog,
    handleClose,
    confirmClose,
    handleFormDirtyChange,
    handleFormSubmitSuccess: baseHandleFormSubmitSuccess,
  } = useUnsavedGuard(onClose);

  const handleFormSubmitSuccess = useCallback(() => {
    const to = projectId && dataMartId ? `/ui/${projectId}/data-marts/${dataMartId}/reports` : '/';
    const isOnDestinationsPage = pathname.includes('/reports');
    if (!isOnDestinationsPage) {
      toast(t('reportsUi.reportCreatedToast', 'Đã tạo báo cáo'), {
        closeButton: true,
        description: (
          <>
            {t('reportsUi.viewItInDestinations', 'Bạn có thể xem trong trang Điểm đến')}{' '}
            <Link to={to} className='underline underline-offset-4' onClick={() => toast.dismiss()}>
              {t('destinationsPage.title', 'Điểm đến')}
            </Link>{' '}
          </>
        ),
        duration: Infinity,
      });
    }
    void onSubmitSuccess?.();
    baseHandleFormSubmitSuccess();
  }, [baseHandleFormSubmitSuccess, dataMartId, onSubmitSuccess, pathname, projectId, t]);

  useIntercomLauncher(isOpen);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {preSelectedDestination?.title ??
              (mode === ReportFormMode.CREATE
                ? t('reportsUi.createReportSheetTitle', 'Tạo báo cáo')
                : t('reportsUi.report', 'Báo cáo'))}
          </SheetTitle>
          <ReportSheetDescription mode={mode} report={initialReport}>
            {mode === ReportFormMode.CREATE
              ? t('reportsUi.createReportSheetDescription', 'Điền thông tin để tạo báo cáo mới')
              : t('reportsUi.editReportSheetDescription', 'Cập nhật thông tin của báo cáo hiện có')}
          </ReportSheetDescription>
        </SheetHeader>

        <DataDestinationProvider>
          <EmailReportEditForm
            initialReport={initialReport}
            mode={mode}
            onDirtyChange={handleFormDirtyChange}
            onSubmit={handleFormSubmitSuccess}
            onCancel={handleClose}
            preSelectedDestination={preSelectedDestination}
            prefill={prefill}
            allowedDestinationTypes={allowedDestinationTypes}
            isInsightContext={isInsightContext}
            isReadOnly={isReadOnly}
          />
        </DataDestinationProvider>
        <UnsavedChangesConfirmationDialog
          open={showUnsavedDialog}
          onOpenChange={setShowUnsavedDialog}
          onConfirm={confirmClose}
        />
      </SheetContent>
    </Sheet>
  );
}
