import { type BasePermissions, usePermissions } from '../../../../app/permissions';

export interface InsightsPermissions extends BasePermissions {
  canGenerateAI: boolean;
  canRun: boolean;
  canSendAndSchedule: boolean;
}

export function useInsightsPermissions(isLegacyReadOnly = false): InsightsPermissions {
  const permissions = usePermissions<InsightsPermissions>(({ canEdit }) => {
    return {
      canGenerateAI: canEdit,
      canRun: canEdit,
      canSendAndSchedule: canEdit,
    };
  });

  if (!isLegacyReadOnly) return permissions;
  return {
    ...permissions,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canGenerateAI: false,
    canRun: false,
    canSendAndSchedule: false,
  };
}
