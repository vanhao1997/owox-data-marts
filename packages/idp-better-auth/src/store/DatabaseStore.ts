import type {
  AdminUserDetailsView,
  AdminUserView,
  Role,
  DatabaseMember,
  DatabaseOrganization,
  DatabaseInvitation,
} from '../types/index.js';
import { DatabaseOperationResult, DatabaseUser } from '../types/index.js';

export interface DatabaseStore {
  // Generic health/maintenance
  isHealthy(): Promise<boolean>;
  cleanupExpiredSessions(): Promise<DatabaseOperationResult>;
  getUserCount(): Promise<number>;
  shutdown(): Promise<void>;

  // Expose underlying DB adapter (pool/connection) for Better Auth
  getAdapter(): Promise<unknown>;

  // Users
  getUsers(): Promise<DatabaseUser[]>;
  getUserById(userId: string): Promise<DatabaseUser | null>;
  getUserByEmail(email: string): Promise<DatabaseUser | null>;
  updateUserName(userId: string, name: string): Promise<void>;
  deleteUserCascade(userId: string): Promise<DatabaseOperationResult>;
  userHasPassword(userId: string): Promise<boolean>;
  clearUserPassword(userId: string): Promise<void>;
  revokeUserSessions(userId: string): Promise<void>;
  /**
   * Revoke every session for the user except the one identified by
   * `exceptSessionToken`. Used for self-service password resets where the
   * acting session must stay valid while all other sessions are invalidated.
   */
  revokeOtherUserSessions(userId: string, exceptSessionToken: string): Promise<void>;

  /**
   * Pre-provision a user record for a pending invitation. If a user with the
   * given email already exists, returns that user's id unchanged (idempotent,
   * so repeated invites and re-invitations do not create duplicates).
   *
   * The stub is created with `emailVerified = false`; Better Auth will flip it
   * to `true` on the first successful magic-link verification. Callers must
   * not rely on the presence of this row for authentication — it only exists
   * so the application can attach authorization scope before sign-in.
   *
   * Returns `{ userId, created }` where `created` is true when a fresh row was
   * inserted and false when the user already existed.
   */
  createUserStub(email: string, name?: string): Promise<{ userId: string; created: boolean }>;

  // Organization and roles
  defaultOrganizationExists(slug: string): Promise<boolean>;
  createDefaultOrganizationForUser(
    org: { id: string; name: string; slug: string },
    userId: string,
    role: Role
  ): Promise<void>;
  addUserToOrganization(orgId: string, userId: string, role: Role): Promise<void>;
  getUserRole(orgId: string, userId: string): Promise<string | null>;
  listOrganizationsForUser(userId: string): Promise<DatabaseOrganization[]>;
  getOrganization(orgId: string): Promise<DatabaseOrganization | null>;
  createOrganization(org: DatabaseOrganization, userId: string, role: Role): Promise<void>;
  updateOrganization(orgId: string, name: string, metadata?: string | null): Promise<void>;
  listOrganizationMembers(orgId: string): Promise<DatabaseMember[]>;
  removeUserFromOrganization(orgId: string, userId: string): Promise<void>;
  countOrganizationsForUser(userId: string): Promise<number>;
  createInvitation(invitation: DatabaseInvitation): Promise<void>;
  getInvitation(invitationId: string): Promise<DatabaseInvitation | null>;
  updateInvitation(
    invitationId: string,
    values: Partial<Pick<DatabaseInvitation, 'status' | 'expiresAt'>>
  ): Promise<void>;
  /** Atomically consume a pending, unexpired invitation. */
  acceptPendingInvitation(
    invitationId: string,
    userId: string,
    now: string
  ): Promise<DatabaseInvitation | null>;
  listInvitations(orgId: string): Promise<DatabaseInvitation[]>;

  // Admin views
  getUsersForAdmin(): Promise<AdminUserView[]>;
  getUserDetails(userId: string): Promise<AdminUserDetailsView | null>;
}
