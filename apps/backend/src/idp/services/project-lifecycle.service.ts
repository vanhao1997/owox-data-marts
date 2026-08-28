import { Injectable } from '@nestjs/common';
import { ViewOnlyModeError } from '@owox/idp-protocol';
import { IdpProviderService } from './idp-provider.service';
import type { ProjectLifecycleChecker } from '../../common/scheduler/shared/project-lifecycle-checker';

/** Central project lifecycle check for HTTP and background orchestration paths. */
@Injectable()
export class ProjectLifecycleService implements ProjectLifecycleChecker {
  constructor(private readonly idpProviderService: IdpProviderService) {}

  async isArchived(userId: string, projectId: string): Promise<boolean> {
    const project = await this.idpProviderService
      .getProviderFromApp()
      .getProjectForUser(userId, projectId);
    // `blocked` also represents an inaccessible/non-member project in the
    // protocol. Only the explicit archived marker grants read-only access and
    // must trigger lifecycle enforcement.
    return project.archived === true;
  }

  async isProjectArchived(projectId: string): Promise<boolean> {
    const organizationId = projectId === '0' ? 'owox_data_marts_organization' : projectId;
    const provider = this.idpProviderService.getProviderFromApp() as {
      getProjectForUser?: (
        userId: string,
        id: string
      ) => Promise<{
        archived?: boolean;
        status?: string;
      }>;
    };
    // Better Auth exposes organization metadata through getProjectForUser, but
    // that method intentionally requires a user membership. Prefer the native
    // provider helper when available for worker checks that have no user claim.
    const providerWithArchive = provider as typeof provider & {
      isOrganizationArchived?: (id: string) => Promise<boolean>;
    };
    if (providerWithArchive.isOrganizationArchived) {
      return providerWithArchive.isOrganizationArchived(organizationId);
    }
    return false;
  }

  async assertWritable(userId: string, projectId: string): Promise<void> {
    if (await this.isArchived(userId, projectId)) {
      throw new ViewOnlyModeError('Project is archived and read-only');
    }
  }

  async isArchivedForTrigger(trigger: {
    projectId?: unknown;
    createdById?: unknown;
    userId?: unknown;
    dataMart?: { projectId?: unknown };
  }): Promise<boolean> {
    const directProjectId = typeof trigger.projectId === 'string' ? trigger.projectId : '';
    const nestedProjectId =
      typeof trigger.dataMart?.projectId === 'string' ? trigger.dataMart.projectId : '';
    const projectId = directProjectId || nestedProjectId;
    if (!projectId) return false;
    return this.isProjectArchived(projectId);
  }
}
