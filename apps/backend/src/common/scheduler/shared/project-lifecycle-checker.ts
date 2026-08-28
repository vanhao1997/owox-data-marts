/** Token used by scheduler workers to query project lifecycle state without
 * importing the IDP module into the common scheduler module. */
export const PROJECT_LIFECYCLE_CHECKER = 'PROJECT_LIFECYCLE_CHECKER';

export interface ProjectLifecycleChecker {
  isArchivedForTrigger(trigger: {
    projectId?: unknown;
    createdById?: unknown;
    userId?: unknown;
    dataMart?: { projectId?: unknown };
  }): Promise<boolean>;
}
