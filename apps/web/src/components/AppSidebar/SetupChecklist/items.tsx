import { InviteTeammatesCard } from '../../../shared/components/InviteTeammatesCard';
import type { User } from '../../../features/idp/types';
import {
  GroupId,
  ProgressKey,
  SetupStepId,
  StepActionType,
  type SetupGroup,
  type SetupStep,
} from './types';
import type { TFunction } from 'i18next';

const ONBOARDING_QUESTION = {
  USE_CASE: 'use_case',
} as const;

const USE_CASE_ANSWER = {
  SYNC_DWH_SHEETS: 'sync_dwh_sheets',
  IMPORT_EXTERNAL_SHEETS: 'import_external_sheets',
} as const;

const SHEETS_USE_CASES = [USE_CASE_ANSWER.SYNC_DWH_SHEETS, USE_CASE_ANSWER.IMPORT_EXTERNAL_SHEETS];

function hasSheetsUseCase(user: User | null): boolean {
  if (!user?.onboarding?.length) return false;
  const useCaseAnswer = user.onboarding.find(a => a.questionId === ONBOARDING_QUESTION.USE_CASE);
  if (!useCaseAnswer) return false;
  const answerValue = useCaseAnswer.answerValue;
  if (Array.isArray(answerValue)) {
    return answerValue.some(uc =>
      SHEETS_USE_CASES.includes(uc as (typeof SHEETS_USE_CASES)[number])
    );
  }
  return SHEETS_USE_CASES.includes(answerValue as (typeof SHEETS_USE_CASES)[number]);
}

const ROUTES = {
  DATA_MARTS: '/data-marts',
  CREATE_DATA_MART: '/data-marts/create',
  DATA_STORAGES: '/data-storages',
  DESTINATIONS: '/data-destinations',
} as const;

export function getSetupSteps(t: TFunction): SetupStep[] {
  return [
    {
      id: SetupStepId.CREATE_STORAGE,
      stepTitle: t('setupChecklist.createStorage'),
      stepDescription: t('setupChecklist.createStorageDesc'),
      successMessage: t('setupChecklist.storageCreated'),
      action: {
        type: StepActionType.LINK,
        href: ROUTES.DATA_STORAGES,
        label: t('setupChecklist.createStorage'),
      },
      progressKey: ProgressKey.HAS_STORAGE,
    },
    {
      id: SetupStepId.CREATE_DATA_MART,
      stepTitle: t('setupChecklist.createDraftDataMart'),
      stepDescription: t('setupChecklist.createDraftDataMartDesc'),
      successMessage: t('setupChecklist.draftDataMartCreated'),
      action: {
        type: StepActionType.LINK,
        href: ROUTES.CREATE_DATA_MART,
        label: t('setupChecklist.createDraftDataMart'),
      },
      progressKey: ProgressKey.HAS_DRAFT_DATA_MART,
    },
    {
      id: SetupStepId.PUBLISH_DATA_MART,
      stepTitle: t('setupChecklist.publishDataMart'),
      stepDescription: t('setupChecklist.publishDataMartDesc'),
      successMessage: t('setupChecklist.dataMartPublished'),
      action: {
        type: StepActionType.LINK,
        href: ROUTES.DATA_MARTS,
        label: t('setupChecklist.chooseAndPublish'),
      },
      progressKey: ProgressKey.HAS_PUBLISHED_DATA_MART,
    },
    {
      id: SetupStepId.CREATE_DESTINATION,
      stepTitle: t('setupChecklist.createFirstDestination'),
      stepDescription: t('setupChecklist.createFirstDestinationDesc'),
      successMessage: t('setupChecklist.destinationCreated'),
      action: {
        type: StepActionType.LINK,
        href: ROUTES.DESTINATIONS,
        label: t('setupChecklist.createFirstDestination'),
      },
      progressKey: ProgressKey.HAS_DESTINATION,
    },
    {
      id: SetupStepId.CREATE_REPORT,
      stepTitle: t('setupChecklist.createReport'),
      stepDescription: t('setupChecklist.createReportDesc'),
      successMessage: t('setupChecklist.reportCreated'),
      action: {
        type: StepActionType.LINK,
        href: ROUTES.DATA_MARTS,
        label: t('setupChecklist.chooseAndCreateReport'),
      },
      progressKey: ProgressKey.HAS_REPORT,
    },
    {
      id: SetupStepId.REPORT_RUN,
      stepTitle: t('setupChecklist.runReport'),
      stepDescription: t('setupChecklist.runReportDesc'),
      successMessage: t('setupChecklist.reportRunSuccess'),
      action: {
        type: StepActionType.LINK,
        href: ROUTES.DATA_MARTS,
        label: t('setupChecklist.chooseAndRun'),
      },
      progressKey: ProgressKey.HAS_REPORT_RUN,
    },
    {
      id: SetupStepId.INVITE_TEAMMATES,
      stepTitle: t('setupChecklist.inviteTeammates'),
      stepDescription: t('setupChecklist.inviteTeammatesDesc'),
      successMessage: t('setupChecklist.teammatesInvited'),
      action: {
        type: StepActionType.COMPONENT,
        render: ({ onClick }) => <InviteTeammatesCard variant='button' onClick={onClick} />,
      },
      progressKey: ProgressKey.HAS_TEAMMATES_INVITED,
    },
    {
      id: SetupStepId.CREATE_GOOGLE_SHEETS_DESTINATION,
      stepTitle: t('setupChecklist.createGoogleSheetsDestination'),
      stepDescription: t('setupChecklist.createGoogleSheetsDestinationDesc'),
      successMessage: t('setupChecklist.googleSheetsDestinationCreated'),
      action: {
        type: StepActionType.LINK,
        href: ROUTES.DESTINATIONS,
        label: t('setupChecklist.createGoogleSheetsBtn'),
      },
      progressKey: ProgressKey.HAS_GOOGLE_SHEETS_DESTINATION,
    },
    {
      id: SetupStepId.INSTALL_GOOGLE_SHEETS_EXTENSION,
      stepTitle: t('setupChecklist.installGoogleSheetsExtension'),
      stepDescription: t('setupChecklist.installGoogleSheetsExtensionDesc'),
      successMessage: t('setupChecklist.extensionInstalled'),
      action: {
        type: StepActionType.LINK,
        href: 'https://workspace.google.com/marketplace/app/owox_data_marts/94902851409',
        label: t('setupChecklist.installExtension'),
        openInNewTab: true,
      },
      progressKey: ProgressKey.HAS_GOOGLE_SHEETS_EXTENSION,
    },
    {
      id: SetupStepId.CREATE_RUN_REPORT_FROM_EXTENSION,
      stepTitle: t('setupChecklist.createRunReportFromExtension'),
      stepDescription: t('setupChecklist.createRunReportFromExtensionDesc'),
      successMessage: t('setupChecklist.reportCreatedFromExtension'),
      action: {
        type: StepActionType.LINK,
        href: 'https://sheets.new',
        label: t('setupChecklist.goToGoogleSheets'),
        openInNewTab: true,
      },
      progressKey: ProgressKey.HAS_GOOGLE_SHEETS_REPORT_RUN,
    },
  ];
}

export function getSetupGroups(t: TFunction): SetupGroup[] {
  return [
    {
      id: GroupId.STORAGE,
      title: t('setupChecklist.groupCreateStorage'),
      description: t('setupChecklist.groupCreateStorageDesc'),
      stepIds: [SetupStepId.CREATE_STORAGE],
    },
    {
      id: GroupId.PUBLISH,
      title: t('setupChecklist.groupPublishDataMart'),
      description: t('setupChecklist.groupPublishDataMartDesc'),
      stepIds: [SetupStepId.CREATE_DATA_MART, SetupStepId.PUBLISH_DATA_MART],
    },
    {
      id: GroupId.REPORT,
      title: t('setupChecklist.groupGetData'),
      description: t('setupChecklist.groupGetDataDesc'),
      stepIds: [SetupStepId.CREATE_DESTINATION, SetupStepId.CREATE_REPORT, SetupStepId.REPORT_RUN],
      isConditional: true,
      showCondition: (user: User | null) => !hasSheetsUseCase(user),
    },
    {
      id: GroupId.ENABLE_GOOGLE_SHEETS,
      title: t('setupChecklist.groupGoogleSheets'),
      description: t('setupChecklist.groupGoogleSheetsDesc'),
      stepIds: [
        SetupStepId.CREATE_GOOGLE_SHEETS_DESTINATION,
        SetupStepId.INSTALL_GOOGLE_SHEETS_EXTENSION,
        SetupStepId.CREATE_RUN_REPORT_FROM_EXTENSION,
      ],
      isConditional: true,
      showCondition: (user: User | null) => hasSheetsUseCase(user),
    },
    {
      id: GroupId.INVITE_TEAMMATES,
      title: t('setupChecklist.groupInviteTeammates'),
      description: t('setupChecklist.groupInviteTeammatesDesc'),
      stepIds: [SetupStepId.INVITE_TEAMMATES],
    },
  ];
}