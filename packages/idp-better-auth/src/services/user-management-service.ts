import { createBetterAuthConfig } from '../auth/auth-config.js';
import { MagicLinkService } from './magic-link-service.js';
import { CryptoService } from './crypto-service.js';
import { Payload, AddUserCommandResponse } from '@owox/idp-protocol';
import type { Role } from '../types/index.js';
import type { Request as ExpressRequest } from 'express';
import type { DatabaseStore } from '../store/DatabaseStore.js';
import { logger } from '../logger.js';
import crypto from 'node:crypto';

export class UserManagementService {
  private static readonly DEFAULT_ORGANIZATION_ID = 'owox_data_marts_organization';
  private static readonly DEFAULT_ORGANIZATION_NAME = 'OWOX Data Marts';
  private static readonly DEFAULT_ORGANIZATION_SLUG = 'owox-data-marts';

  /**
   * Role hierarchy permissions
   * admin can invite: admin, editor, viewer
   * editor can invite: editor, viewer
   * viewer can invite: viewer
   */
  private static readonly roleHierarchy: Record<Role, Role[]> = {
    admin: ['admin', 'editor', 'viewer'],
    editor: ['editor', 'viewer'],
    viewer: ['viewer'],
  };

  constructor(
    private readonly auth: Awaited<ReturnType<typeof createBetterAuthConfig>>,
    private readonly magicLinkService: MagicLinkService,
    private readonly cryptoService: CryptoService | undefined,
    private readonly store: DatabaseStore
  ) {}

  async addUserViaMagicLink(username: string): Promise<AddUserCommandResponse> {
    try {
      const magicLink = await this.magicLinkService.generateMagicLink(username);

      return {
        username,
        magicLink,
      };
    } catch (error) {
      logger.error('Error adding user', { username }, error as Error);
      throw new Error(
        `Failed to add user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Pre-provision an invitation: upsert a stub user, ensure organization
   * membership with the target role, and generate a magic link so the invitee
   * can sign in. Returns the userId so the caller can attach authorization
   * scope (contexts / role scope) immediately, before first sign-in.
   *
   * Idempotent w.r.t. user creation: re-invites reuse the existing user row
   * and just rotate the magic-link token.
   */
  async inviteAndCreateStub(
    email: string,
    role: Role,
    projectId = UserManagementService.DEFAULT_ORGANIZATION_ID,
    actorUserId = 'system'
  ): Promise<{
    userId: string;
    magicLink: string;
    invitationId?: string;
    expiresAt?: string;
  }> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        throw new Error('Invalid invitation email');
      }
      const { userId } = await this.store.createUserStub(normalizedEmail);
      // Keep compatibility with test doubles and older providers while all
      // shipped Better Auth stores use the invitation table.
      if (!this.store.createInvitation) {
        await this.ensureUserInOrganization(userId, role, projectId);
        return {
          userId,
          magicLink: await this.magicLinkService.generateMagicLink(normalizedEmail, role),
        };
      }
      const invitationId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await this.store.createInvitation({
        id: invitationId,
        organizationId: projectId,
        email: normalizedEmail,
        role,
        status: 'pending',
        inviterId: actorUserId,
        expiresAt,
        createdAt: new Date().toISOString(),
      });
      const magicLink = await this.magicLinkService.generateMagicLink(
        normalizedEmail,
        role,
        projectId === UserManagementService.DEFAULT_ORGANIZATION_ID ? '0' : projectId,
        invitationId
      );
      return { userId, magicLink, invitationId, expiresAt };
    } catch (error) {
      logger.error('Error pre-provisioning invitation', { email, role }, error as Error);
      throw new Error(
        `Failed to prepare invitation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async listUsers(): Promise<Payload[]> {
    try {
      const users = await this.store.getUsersForAdmin();

      return users.map((user): Payload => {
        const role: Role = this.isValidRole(user.role) ? user.role : 'viewer';
        return {
          userId: user.id,
          projectId: UserManagementService.DEFAULT_ORGANIZATION_ID,
          email: user.email,
          fullName: user.name || user.email,
          roles: [role],
        };
      });
    } catch (error) {
      logger.error('Error listing users', {}, error as Error);
      throw new Error('Failed to list users');
    }
  }

  async removeUser(userId: string): Promise<void> {
    try {
      await this.store.deleteUserCascade(userId);
    } catch (error) {
      logger.error('Error removing user', { userId }, error as Error);
      throw new Error(
        `Failed to remove user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async addMemberToOrganization(req: ExpressRequest, role: Role): Promise<void> {
    const session = await this.auth.api.getSession({
      headers: req.headers as unknown as Headers,
    });

    if (!session) {
      throw new Error('No session found');
    }

    const defaultOrg = {
      id: UserManagementService.DEFAULT_ORGANIZATION_ID,
      name: UserManagementService.DEFAULT_ORGANIZATION_NAME,
      slug: UserManagementService.DEFAULT_ORGANIZATION_SLUG,
    } as const;

    if (!(await this.store.defaultOrganizationExists(defaultOrg.slug))) {
      await this.store.createDefaultOrganizationForUser(defaultOrg, session.user.id, role);
    } else {
      await this.store.addUserToOrganization(defaultOrg.id, session.user.id, role);
    }
  }

  async getUsersForAdmin(): Promise<
    Array<{
      id: string;
      email: string;
      name: string | null;
      role: string;
      createdAt: string;
      updatedAt: string | null;
    }>
  > {
    try {
      return await this.store.getUsersForAdmin();
    } catch (error) {
      logger.error('Error getting users for admin', {}, error as Error);
      throw new Error('Failed to get users for admin');
    }
  }

  async getUserDetails(userId: string): Promise<{
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
    updatedAt: string | null;
    organizationId: string | null;
    hasPassword?: boolean;
  } | null> {
    try {
      const userDetails = await this.store.getUserDetails(userId);
      if (!userDetails) {
        return null;
      }

      const hasPassword = await this.store.userHasPassword(userId);

      return {
        ...userDetails,
        hasPassword,
      };
    } catch (error) {
      logger.error('Error getting user details', { userId }, error as Error);
      throw new Error('Failed to get user details');
    }
  }

  async generateMagicLinkForUser(
    email: string,
    role: Role,
    projectId = '0',
    invitationId?: string
  ): Promise<string> {
    try {
      if (!this.cryptoService) {
        throw new Error('CryptoService not available for magic link generation');
      }

      const magicLink = await this.magicLinkService.generateMagicLink(
        email,
        role,
        projectId,
        invitationId
      );
      return magicLink;
    } catch (error) {
      logger.error('Error generating magic link for user', { email, role }, error as Error);
      throw new Error('Failed to generate magic link');
    }
  }

  async updateUserName(userId: string, name: string): Promise<void> {
    try {
      await this.store.updateUserName(userId, name);
    } catch (error) {
      logger.error('Error updating user name', { userId, name }, error as Error);
      throw new Error('Failed to update user name');
    }
  }

  async getUserRole(
    userId: string,
    organizationId = UserManagementService.DEFAULT_ORGANIZATION_ID
  ): Promise<string | null> {
    try {
      return await this.store.getUserRole(organizationId, userId);
    } catch (error) {
      logger.error('Failed to get user role', { userId }, error as Error);
      throw new Error('Failed to get user role');
    }
  }

  // ========== Role Permission Methods ==========

  /**
   * Check if current user role can invite target role
   */
  canInviteRole(currentUserRole: Role, targetRole: Role): boolean {
    const allowedRoles = UserManagementService.roleHierarchy[currentUserRole];
    return allowedRoles.includes(targetRole);
  }

  /**
   * Get roles that current user can invite
   */
  getAllowedRolesForInvite(currentUserRole: Role): Role[] {
    return UserManagementService.roleHierarchy[currentUserRole];
  }

  /**
   * Validate if role exists
   */
  isValidRole(role: string): role is Role {
    return ['admin', 'editor', 'viewer'].includes(role);
  }

  /**
   * Get role priority (higher number = more permissions)
   */
  getRolePriority(role: Role): number {
    const priorities: Record<Role, number> = {
      admin: 3,
      editor: 2,
      viewer: 1,
    };
    return priorities[role];
  }

  /**
   * Check if current role has higher or equal priority than target role
   */
  hasHigherOrEqualPriority(currentRole: Role, targetRole: Role): boolean {
    return this.getRolePriority(currentRole) >= this.getRolePriority(targetRole);
  }

  /**
   * Reset user password (admin-only operation)
   * Clears existing password, revokes sessions, and generates new magic link
   *
   * Session handling:
   * - Resetting another user's password revokes ALL of that user's sessions.
   * - Resetting your own password (self-reset) revokes every OTHER session but
   *   keeps the acting session valid, provided `currentSessionToken` is given.
   *   Without it we fall back to revoking all sessions to stay fail-safe.
   */
  async resetUserPassword(
    userId: string,
    adminUserId: string,
    currentSessionToken?: string
  ): Promise<{ magicLink: string }> {
    try {
      const adminRole = await this.getUserRole(adminUserId);
      if (adminRole !== 'admin') {
        throw new Error('Only administrators can reset user passwords');
      }

      const user = await this.store.getUserById(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const userRole = await this.getUserRole(userId);
      if (!userRole || !this.isValidRole(userRole)) {
        throw new Error(`User ${userId} has invalid or missing role`);
      }

      if (userId !== adminUserId) {
        await this.store.revokeUserSessions(userId);
      } else if (currentSessionToken) {
        await this.store.revokeOtherUserSessions(userId, currentSessionToken);
      } else {
        await this.store.revokeUserSessions(userId);
      }

      // Generate the magic link before clearing the password so a failure here
      // can't leave the user password-less and without a way back in — clearing
      // the credential is kept as the last destructive step.
      const magicLink = await this.magicLinkService.generateMagicLink(user.email, userRole as Role);

      await this.store.clearUserPassword(userId);

      logger.info('Password reset initiated', {
        userEmail: user.email,
        userId,
        userRole,
        adminUserId,
      });

      return { magicLink };
    } catch (error) {
      logger.error('Error resetting user password', { userId, adminUserId }, error as Error);
      throw new Error(
        `Failed to reset password: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Ensure user is added to default organization with specified role
   * Creates organization if it doesn't exist
   */
  async ensureUserInDefaultOrganization(userId: string, role: Role): Promise<void> {
    return this.ensureUserInOrganization(
      userId,
      role,
      UserManagementService.DEFAULT_ORGANIZATION_ID
    );
  }

  async ensureUserInOrganization(
    userId: string,
    role: Role,
    organizationId: string
  ): Promise<void> {
    try {
      const defaultOrg = {
        id: organizationId,
        name: UserManagementService.DEFAULT_ORGANIZATION_NAME,
        slug: UserManagementService.DEFAULT_ORGANIZATION_SLUG,
      } as const;

      const storeWithOrganization = this.store as Omit<DatabaseStore, 'getOrganization'> & {
        getOrganization?: DatabaseStore['getOrganization'];
      };
      const exists = storeWithOrganization.getOrganization
        ? Boolean(await storeWithOrganization.getOrganization(organizationId))
        : await this.store.defaultOrganizationExists(defaultOrg.slug);
      if (!exists) {
        await this.store.createDefaultOrganizationForUser(defaultOrg, userId, role);
      } else {
        await this.store.addUserToOrganization(defaultOrg.id, userId, role);
      }
    } catch (error) {
      logger.error('Error ensuring user in default organization', { userId, role }, error as Error);
      throw new Error(
        `Failed to add user to organization: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async acceptInvitation(
    invitationId: string,
    userId: string,
    email: string
  ): Promise<{ role: Role; organizationId: string }> {
    const invitation = await this.store.getInvitation(invitationId);
    if (
      !invitation ||
      invitation.status !== 'pending' ||
      new Date(invitation.expiresAt) < new Date()
    ) {
      throw new Error('Invitation is invalid or expired');
    }
    if (invitation.email.toLowerCase() !== email.toLowerCase()) {
      throw new Error('Invitation email does not match signed-in email');
    }
    if (
      this.store.getOrganization &&
      !(await this.store.getOrganization(invitation.organizationId))
    ) {
      throw new Error('Invitation project no longer exists');
    }
    if (await this.isOrganizationArchived(invitation.organizationId)) {
      throw new Error('Invitation project is archived');
    }
    const accepted = this.store.acceptPendingInvitation
      ? await this.store.acceptPendingInvitation(invitationId, userId, new Date().toISOString())
      : (await this.store.updateInvitation(invitationId, { status: 'accepted' }), invitation);
    if (!accepted) throw new Error('Invitation is invalid or expired');
    return { role: accepted.role, organizationId: accepted.organizationId };
  }

  async isOrganizationArchived(organizationId: string): Promise<boolean> {
    const storeWithOrganization = this.store as Omit<DatabaseStore, 'getOrganization'> & {
      getOrganization?: DatabaseStore['getOrganization'];
    };
    if (!storeWithOrganization.getOrganization) return false;
    const organization = await storeWithOrganization.getOrganization(organizationId);
    if (!organization?.metadata) return false;
    try {
      return Boolean((JSON.parse(organization.metadata) as { archived?: boolean }).archived);
    } catch {
      return false;
    }
  }

  /** Resolve a session's active organization. An explicitly selected archived
   * project remains selected so its data can be read in view-only mode. */
  async resolveActiveOrganizationId(
    userId: string,
    requestedOrganizationId?: string
  ): Promise<string | null> {
    const normalizedRequestedId =
      requestedOrganizationId === '0'
        ? UserManagementService.DEFAULT_ORGANIZATION_ID
        : requestedOrganizationId;
    const organizations = this.store.listOrganizationsForUser
      ? await this.store.listOrganizationsForUser(userId)
      : [];
    if (organizations.length === 0) {
      const fallback = normalizedRequestedId ?? UserManagementService.DEFAULT_ORGANIZATION_ID;
      return (await this.store.getUserRole(fallback, userId)) ? fallback : null;
    }

    const requested = normalizedRequestedId
      ? organizations.find(org => org.id === normalizedRequestedId)
      : undefined;
    if (requested) return requested.id;

    for (const organization of organizations) {
      if (!(await this.isOrganizationArchived(organization.id))) return organization.id;
    }
    return null;
  }

  /** Return the first non-archived organization for fallback after archiving. */
  async resolveFirstActiveOrganizationId(userId: string): Promise<string | null> {
    const organizations = this.store.listOrganizationsForUser
      ? await this.store.listOrganizationsForUser(userId)
      : [];
    for (const organization of organizations) {
      if (!(await this.isOrganizationArchived(organization.id))) return organization.id;
    }
    return null;
  }

  async getOrganizationTitle(organizationId: string): Promise<string | null> {
    if (!this.store.getOrganization) return null;
    const organization = await this.store.getOrganization(organizationId);
    return organization?.name ?? null;
  }
}
