import { Injectable, Logger, Optional } from '@nestjs/common';
import type { ProjectMemberInvitation } from '@owox/idp-protocol';
import { IdpProjectionsFacade } from '../../../idp/facades/idp-projections.facade';
import { InviteProjectMemberCommand } from '../../dto/domain/invite-project-member.command';
import { toIdpRole } from '../../mappers/project-members.mapper';
import { ContextAccessService } from '../../services/context/context-access.service';
import { ContextService } from '../../services/context/context.service';
import {
  applyLocalMemberScope,
  resolveEffectiveScope,
  validateContextIdsIfAny,
} from './util/member-scope-saga.util';
import { ProjectMembershipReconciliationService } from '../../../idp/services/project-membership-reconciliation.service';

@Injectable()
export class InviteProjectMemberService {
  private readonly logger = new Logger(InviteProjectMemberService.name);

  constructor(
    private readonly idpProjectionsFacade: IdpProjectionsFacade,
    private readonly contextAccessService: ContextAccessService,
    private readonly contextService: ContextService,
    @Optional() private readonly pendingScopeService?: ProjectMembershipReconciliationService
  ) {}

  async run(command: InviteProjectMemberCommand): Promise<ProjectMemberInvitation> {
    const { projectId, actorUserId, email, role, roleScope, contextIds } = command;

    const effectiveScope = resolveEffectiveScope(role, roleScope, contextIds);

    await validateContextIdsIfAny(this.contextService, contextIds, projectId);

    const invitation = await this.idpProjectionsFacade.inviteMember(
      projectId,
      email,
      toIdpRole(role),
      actorUserId
    );

    // Better Auth invitations return an invitation id and must not receive
    // local context access until the magic link is accepted. Legacy providers
    // without invitation lifecycle still preserve their existing behavior.
    if (invitation.userId && !invitation.invitationId) {
      await applyLocalMemberScope({
        contextAccessService: this.contextAccessService,
        logger: this.logger,
        userId: invitation.userId,
        projectId,
        role,
        effectiveScope,
        contextIds,
        failureLabel: `Invite accepted by IDP for ${email} in project ${projectId}`,
      });
    } else if (invitation.invitationId && this.pendingScopeService) {
      try {
        await this.pendingScopeService.savePendingScope({
          invitation,
          projectId,
          email,
          role,
          roleScope: effectiveScope,
          contextIds,
        });
      } catch (error) {
        // Avoid leaving an invitation that can never restore its local scope.
        try {
          await this.idpProjectionsFacade.cancelInvitation(
            projectId,
            invitation.invitationId,
            actorUserId
          );
        } catch (cancelError) {
          this.logger.error(
            'Failed to cancel invitation after scope persistence failure',
            cancelError
          );
        }
        throw error;
      }
    } else if (invitation.invitationId) {
      this.logger.warn('Invitation scope persistence is unavailable; invitation remains pending');
    }

    return invitation;
  }
}
