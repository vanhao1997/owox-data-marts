import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectProjection } from './entities/project-projection.entity';
import { UserProjection } from './entities/user-projection.entity';
import { IdpProjectionsFacade } from './facades/idp-projections.facade';
import { MCP_PROJECT_CONTEXT_FACADE } from './facades/mcp-project-context.facade';
import { McpProjectContextFacadeImpl } from './facades/mcp-project-context.facade.impl';
import { IdpGuard } from './guards';
import { IdpExceptionFilter } from './filters/idp-exception.filter';
import { ProjectionsMapper } from './mappers/projections.mapper';
import { IdpProjectionsService } from './services/idp-projections.service';
import { IdpProviderService } from './services/idp-provider.service';
import { TenantGuardService } from './services/tenant-guard.service';
import { IntercomController } from './controllers/intercom.controller';
import { AuthContextController } from './controllers/auth-context.controller';
import { IssueIntercomJwtService } from './use-cases/issue-intercom-jwt.service';
import { IntercomMapper } from './mappers/intercom.mapper';
import { OAuthModule } from './oauth/oauth.module';
import { ProjectLifecycleService } from './services/project-lifecycle.service';
import { ProjectMembershipReconciliationService } from './services/project-membership-reconciliation.service';
import { PendingMemberInvitationScope } from '../data-marts/entities/pending-member-invitation-scope.entity';
import { MemberRoleScope } from '../data-marts/entities/member-role-scope.entity';
import { MemberRoleContext } from '../data-marts/entities/member-role-context.entity';
import { PROJECT_LIFECYCLE_CHECKER } from '../common/scheduler/shared/project-lifecycle-checker';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProjection,
      ProjectProjection,
      PendingMemberInvitationScope,
      MemberRoleScope,
      MemberRoleContext,
    ]),
    OAuthModule,
  ],
  controllers: [IntercomController, AuthContextController],
  providers: [
    IdpProviderService,
    IdpProjectionsService,
    IdpGuard,
    IssueIntercomJwtService,
    IntercomMapper,
    TenantGuardService,
    ProjectLifecycleService,
    ProjectMembershipReconciliationService,
    { provide: PROJECT_LIFECYCLE_CHECKER, useExisting: ProjectLifecycleService },
    {
      provide: APP_FILTER,
      useClass: IdpExceptionFilter,
    },
    ProjectionsMapper,
    IdpProjectionsFacade,
    {
      provide: MCP_PROJECT_CONTEXT_FACADE,
      useClass: McpProjectContextFacadeImpl,
    },
  ],
  exports: [
    IdpProviderService,
    IdpProjectionsService,
    IdpGuard,
    IdpProjectionsFacade,
    MCP_PROJECT_CONTEXT_FACADE,
    TenantGuardService,
    ProjectLifecycleService,
    ProjectMembershipReconciliationService,
    PROJECT_LIFECYCLE_CHECKER,
    OAuthModule,
  ],
})
export class IdpModule {}
