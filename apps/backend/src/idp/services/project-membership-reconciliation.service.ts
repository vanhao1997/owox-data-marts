import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { IdpProvider, ProjectMemberInvitation } from '@owox/idp-protocol';
import { Repository } from 'typeorm';
import { IdpProviderService } from './idp-provider.service';
import { PendingMemberInvitationScope } from '../../data-marts/entities/pending-member-invitation-scope.entity';
import { MemberRoleScope } from '../../data-marts/entities/member-role-scope.entity';
import { MemberRoleContext } from '../../data-marts/entities/member-role-context.entity';
import { ProjectRole } from '../../data-marts/enums/project-role.enum';
import { RoleScope } from '../../data-marts/enums/role-scope.enum';

/** Applies invitation context scope only after IDP membership is accepted. */
@Injectable()
export class ProjectMembershipReconciliationService {
  private readonly logger = new Logger(ProjectMembershipReconciliationService.name);

  constructor(
    @InjectRepository(PendingMemberInvitationScope)
    private readonly pendingRepository: Repository<PendingMemberInvitationScope>,
    @InjectRepository(MemberRoleScope)
    private readonly roleScopeRepository: Repository<MemberRoleScope>,
    @InjectRepository(MemberRoleContext)
    private readonly roleContextRepository: Repository<MemberRoleContext>,
    private readonly idpProviderService: IdpProviderService
  ) {}

  async savePendingScope(args: {
    invitation: ProjectMemberInvitation;
    projectId: string;
    email: string;
    role: ProjectRole;
    roleScope: RoleScope;
    contextIds: string[];
  }): Promise<void> {
    if (!args.invitation.invitationId) return;
    await this.pendingRepository.save({
      invitationId: args.invitation.invitationId,
      projectId: args.projectId,
      email: args.email.trim().toLowerCase(),
      role: args.role,
      roleScope: args.roleScope,
      contextIdsJson: JSON.stringify(args.contextIds),
    });
  }

  async reconcile(userId: string, email?: string): Promise<void> {
    if (!email) return;
    const pending = await this.pendingRepository.find({
      where: { email: email.trim().toLowerCase() },
      order: { createdAt: 'ASC' },
    });

    for (const row of pending) {
      try {
        const provider = this.idpProviderService.getProviderFromApp() as IdpProvider & {
          isInvitationAccepted?: (
            invitationId: string,
            projectId: string,
            email: string
          ) => Promise<boolean>;
        };
        if (
          !provider.isInvitationAccepted ||
          !(await provider.isInvitationAccepted(row.invitationId, row.projectId, row.email))
        ) {
          continue;
        }
        const members = await provider.getProjectMembers(row.projectId);
        const member = members.find(item => item.userId === userId);
        if (!member) continue;

        const contextIds = this.parseContextIds(row.contextIdsJson);
        const role = row.role as ProjectRole;
        const roleScope =
          role === ProjectRole.ADMIN ? RoleScope.ENTIRE_PROJECT : (row.roleScope as RoleScope);
        const effectiveContextIds = role === ProjectRole.ADMIN ? [] : contextIds;

        await this.roleContextRepository.delete({ userId, projectId: row.projectId });
        if (effectiveContextIds.length > 0) {
          await this.roleContextRepository.save(
            effectiveContextIds.map(contextId => ({
              userId,
              projectId: row.projectId,
              contextId,
            }))
          );
        }
        await this.roleScopeRepository.upsert({ userId, projectId: row.projectId, roleScope }, [
          'userId',
          'projectId',
        ]);
        await this.pendingRepository.delete({ invitationId: row.invitationId });
      } catch (error) {
        // Keep pending state for retry on the next authenticated request.
        this.logger.error(
          `Failed to reconcile invitation ${row.invitationId} for project ${row.projectId}`,
          error instanceof Error ? error.stack : String(error)
        );
      }
    }
  }

  async removePendingScope(invitationId: string): Promise<void> {
    await this.pendingRepository.delete({ invitationId });
  }

  private parseContextIds(value: string): string[] {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) && parsed.every(item => typeof item === 'string') ? parsed : [];
    } catch {
      return [];
    }
  }
}
