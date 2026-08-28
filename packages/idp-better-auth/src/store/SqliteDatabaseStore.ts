import { randomUUID } from 'crypto';
import type {
  AdminUserDetailsView,
  AdminUserView,
  Role,
  DatabaseOperationResult,
  DatabaseUser,
  DatabaseMember,
  DatabaseOrganization,
  DatabaseInvitation,
} from '../types/index.js';
import type { DatabaseStore } from './DatabaseStore.js';
import { logger } from '../logger.js';

type SqliteRunResult = { changes?: number };
type SqliteStmt = {
  get: (...args: unknown[]) => unknown;
  all: (...args: unknown[]) => unknown[];
  run: (...args: unknown[]) => SqliteRunResult;
};
type SqliteDb = {
  prepare: (sql: string) => SqliteStmt;
  pragma?: (p: string) => void;
  close?: () => void;
};

export class SqliteDatabaseStore implements DatabaseStore {
  private db?: SqliteDb;

  constructor(private readonly dbPath: string) {}

  async connect(): Promise<void> {
    if (this.db) return;
    const { default: DatabaseCtor } = await import('better-sqlite3');
    this.db = new (DatabaseCtor as unknown as new (filename: string, opts?: unknown) => SqliteDb)(
      this.dbPath,
      { fileMustExist: false }
    );
    // Ensure sane defaults
    try {
      this.db.pragma?.('journal_mode = WAL');
    } catch {
      // noop
    }
  }

  private getDb(): SqliteDb {
    if (!this.db) throw new Error('SqliteDatabaseStore is not connected');
    return this.db;
  }

  private generateId(): string {
    return randomUUID();
  }

  async shutdown(): Promise<void> {
    try {
      (this.db as { close?: () => void } | undefined)?.close?.();
    } catch (error) {
      logger.error('Failed to close SQLite database', {}, error as Error);
    } finally {
      this.db = undefined;
    }
  }

  async getAdapter(): Promise<unknown> {
    await this.connect();
    return this.getDb();
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.connect();
      this.getDb().prepare('SELECT 1').get();
      return true;
    } catch {
      return false;
    }
  }

  async cleanupExpiredSessions(): Promise<DatabaseOperationResult> {
    await this.connect();
    const stmt = this.getDb().prepare('DELETE FROM session WHERE expiresAt < datetime("now")');
    const result = stmt.run();
    return { changes: Number(result.changes ?? 0) };
  }

  async getUserCount(): Promise<number> {
    await this.connect();
    const row = this.getDb().prepare('SELECT COUNT(*) as count FROM user').get() as {
      count: number;
    };
    return row?.count ?? 0;
  }

  async getUsers(): Promise<DatabaseUser[]> {
    await this.connect();
    const stmt = this.getDb().prepare(
      'SELECT id, email, name, createdAt FROM user ORDER BY createdAt DESC'
    );
    return stmt.all() as DatabaseUser[];
  }

  async getUserById(userId: string): Promise<DatabaseUser | null> {
    await this.connect();
    const stmt = this.getDb().prepare('SELECT id, email, name, createdAt FROM user WHERE id = ?');
    const row = stmt.get(userId) as DatabaseUser | undefined;
    return row ?? null;
  }

  async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    await this.connect();
    const stmt = this.getDb().prepare(
      'SELECT id, email, name, createdAt FROM user WHERE LOWER(email) = LOWER(?) LIMIT 1'
    );
    const row = stmt.get(email.trim()) as DatabaseUser | undefined;
    return row ?? null;
  }

  async createUserStub(
    email: string,
    name?: string
  ): Promise<{ userId: string; created: boolean }> {
    await this.connect();
    const normalizedEmail = email.trim().toLowerCase();

    const existing = this.getDb()
      .prepare('SELECT id FROM user WHERE LOWER(email) = LOWER(?) LIMIT 1')
      .get(normalizedEmail) as { id: string } | undefined;
    if (existing) {
      return { userId: existing.id, created: false };
    }

    const userId = this.generateId();
    const now = new Date().toISOString();
    this.getDb()
      .prepare(
        'INSERT INTO user (id, email, emailVerified, name, createdAt, updatedAt) VALUES (?, ?, 0, ?, ?, ?)'
      )
      .run(userId, normalizedEmail, name ?? '', now, now);
    return { userId, created: true };
  }

  async userHasPassword(userId: string): Promise<boolean> {
    await this.connect();
    try {
      const stmt = this.getDb().prepare(
        "SELECT password FROM account WHERE userId = ? AND providerId = 'credential'"
      );
      const row = stmt.get(userId) as { password?: string } | undefined;
      logger.debug('Checking user password', { userId, hasPassword: !!row?.password });
      return !!(row?.password && row.password.length > 0);
    } catch (e) {
      logger.error('Error checking user password', { userId }, e as Error);
      return false;
    }
  }

  async clearUserPassword(userId: string): Promise<void> {
    await this.connect();
    try {
      this.getDb()
        .prepare("DELETE FROM account WHERE userId = ? AND providerId = 'credential'")
        .run(userId);
    } catch {
      // Non-fatal: account might not exist
    }
  }

  async revokeUserSessions(userId: string): Promise<void> {
    await this.connect();
    try {
      this.getDb().prepare('DELETE FROM session WHERE userId = ?').run(userId);
    } catch (error) {
      // A zero-row delete does not throw, so this catch only fires on a real DB
      // failure. A silently failed session revoke is a security-relevant event,
      // so log it rather than swallowing.
      logger.error('Failed to revoke user sessions', { userId }, error as Error);
    }
  }

  async revokeOtherUserSessions(userId: string, exceptSessionToken: string): Promise<void> {
    await this.connect();
    try {
      this.getDb()
        .prepare('DELETE FROM session WHERE userId = ? AND token != ?')
        .run(userId, exceptSessionToken);
    } catch (error) {
      logger.error('Failed to revoke other user sessions', { userId }, error as Error);
    }
  }

  async updateUserName(userId: string, name: string): Promise<void> {
    await this.connect();
    const stmt = this.getDb().prepare('UPDATE user SET name = ? WHERE id = ?');
    const res = stmt.run(name, userId);
    if (!res.changes) throw new Error(`User ${userId} not found or not updated`);
  }

  async deleteUserCascade(userId: string): Promise<DatabaseOperationResult> {
    await this.connect();
    try {
      try {
        this.getDb().prepare('DELETE FROM session WHERE userId = ?').run(userId);
      } catch (error) {
        // Continue the cascade, but a failed session removal is security-relevant
        // (orphaned sessions could outlive the user) — log rather than swallow.
        logger.error('Failed to delete user sessions during cascade', { userId }, error as Error);
      }
      try {
        this.getDb().prepare('DELETE FROM account WHERE userId = ?').run(userId);
      } catch (error) {
        logger.error('Failed to delete user accounts during cascade', { userId }, error as Error);
      }
      try {
        this.getDb().prepare('DELETE FROM member WHERE userId = ?').run(userId);
      } catch (error) {
        logger.error(
          'Failed to delete user memberships during cascade',
          { userId },
          error as Error
        );
      }
      const res = this.getDb().prepare('DELETE FROM user WHERE id = ?').run(userId);
      if (!res.changes) throw new Error(`User ${userId} not found`);
      return { changes: Number(res.changes ?? 0) };
    } catch (e) {
      throw new Error(
        `Failed to delete user ${userId}: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  async defaultOrganizationExists(slug: string): Promise<boolean> {
    await this.connect();
    const stmt = this.getDb().prepare('SELECT id FROM organization WHERE slug = ? LIMIT 1');
    const row = stmt.get(slug) as { id: string } | undefined;
    return !!row;
  }

  async createDefaultOrganizationForUser(
    org: { id: string; name: string; slug: string },
    userId: string,
    role: Role
  ): Promise<void> {
    await this.connect();
    const now = new Date().toISOString();
    try {
      this.getDb()
        .prepare(
          'INSERT INTO organization (id, name, slug, metadata, createdAt) VALUES (?, ?, ?, ?, ?)'
        )
        .run(
          org.id,
          org.name,
          org.slug,
          JSON.stringify({ isDefault: true, createdBy: userId }),
          now
        );

      this.getDb()
        .prepare(
          'INSERT INTO member (id, organizationId, userId, role, createdAt) VALUES (?, ?, ?, ?, ?)'
        )
        .run(this.generateId(), org.id, userId, role, now);
    } catch (err) {
      const msg = String(err);
      if (msg.includes('UNIQUE constraint failed') || msg.includes('already exists')) {
        await this.addUserToOrganization(org.id, userId, role);
        return;
      }
      throw err;
    }
  }

  async addUserToOrganization(orgId: string, userId: string, role: Role): Promise<void> {
    await this.connect();
    const existing = this.getDb()
      .prepare('SELECT role FROM member WHERE userId = ? AND organizationId = ?')
      .get(userId, orgId) as { role: string } | undefined;

    if (existing) {
      this.getDb()
        .prepare('UPDATE member SET role = ? WHERE userId = ? AND organizationId = ?')
        .run(role, userId, orgId);
    } else {
      const now = new Date().toISOString();
      this.getDb()
        .prepare(
          'INSERT INTO member (id, organizationId, userId, role, createdAt) VALUES (?, ?, ?, ?, ?)'
        )
        .run(this.generateId(), orgId, userId, role, now);
    }
  }

  async getUserRole(orgId: string, userId: string): Promise<string | null> {
    await this.connect();
    const row = this.getDb()
      .prepare('SELECT role FROM member WHERE userId = ? AND organizationId = ?')
      .get(userId, orgId) as { role: string } | undefined;
    return row?.role ?? null;
  }

  async listOrganizationsForUser(userId: string): Promise<DatabaseOrganization[]> {
    await this.connect();
    const rows = this.getDb()
      .prepare(
        `SELECT o.id, o.name, o.slug, o.metadata, o.createdAt
       FROM organization o INNER JOIN member m ON m.organizationId = o.id
       WHERE m.userId = ? ORDER BY o.createdAt ASC`
      )
      .all(userId) as DatabaseOrganization[];
    return rows;
  }

  async getOrganization(orgId: string): Promise<DatabaseOrganization | null> {
    await this.connect();
    const row = this.getDb()
      .prepare('SELECT id, name, slug, metadata, createdAt FROM organization WHERE id = ?')
      .get(orgId) as DatabaseOrganization | undefined;
    return row ?? null;
  }

  async createOrganization(org: DatabaseOrganization, userId: string, role: Role): Promise<void> {
    await this.connect();
    const db = this.getDb();
    const now = new Date().toISOString();
    db.prepare('BEGIN IMMEDIATE').run();
    try {
      const count = db
        .prepare('SELECT COUNT(*) as count FROM member WHERE userId = ?')
        .get(userId) as { count?: number };
      if (Number(count?.count ?? 0) >= 20) {
        throw new Error('Project limit reached');
      }
      db.prepare(
        'INSERT INTO organization (id, name, slug, metadata, createdAt) VALUES (?, ?, ?, ?, ?)'
      ).run(org.id, org.name, org.slug, org.metadata ?? null, org.createdAt ?? now);
      db.prepare(
        'INSERT INTO member (id, organizationId, userId, role, createdAt) VALUES (?, ?, ?, ?, ?)'
      ).run(this.generateId(), org.id, userId, role, now);
      db.prepare('COMMIT').run();
    } catch (error) {
      try {
        db.prepare('ROLLBACK').run();
      } catch {
        // Preserve the original storage error.
      }
      throw error;
    }
  }

  async updateOrganization(orgId: string, name: string, metadata?: string | null): Promise<void> {
    await this.connect();
    const result = this.getDb()
      .prepare('UPDATE organization SET name = ?, metadata = COALESCE(?, metadata) WHERE id = ?')
      .run(name, metadata ?? null, orgId);
    if (!result.changes) throw new Error(`Organization ${orgId} not found`);
  }

  async listOrganizationMembers(orgId: string): Promise<DatabaseMember[]> {
    await this.connect();
    const rows = this.getDb()
      .prepare(
        `SELECT m.id, m.organizationId, m.userId, m.role, m.createdAt,
              u.id as user_id, u.email as user_email, u.name as user_name
       FROM member m INNER JOIN user u ON u.id = m.userId
       WHERE m.organizationId = ? ORDER BY m.createdAt ASC`
      )
      .all(orgId) as Record<string, unknown>[];
    return rows.map((row: Record<string, unknown>) => ({
      id: row.id,
      organizationId: row.organizationId,
      userId: row.userId,
      role: row.role,
      createdAt: row.createdAt,
      user: {
        id: String(row.user_id),
        email: String(row.user_email),
        name: row.user_name == null ? undefined : String(row.user_name),
      },
    })) as DatabaseMember[];
  }

  async removeUserFromOrganization(orgId: string, userId: string): Promise<void> {
    await this.connect();
    this.getDb()
      .prepare('DELETE FROM member WHERE organizationId = ? AND userId = ?')
      .run(orgId, userId);
  }

  async countOrganizationsForUser(userId: string): Promise<number> {
    await this.connect();
    const row = this.getDb()
      .prepare('SELECT COUNT(*) as count FROM member WHERE userId = ?')
      .get(userId) as { count: number };
    return Number(row?.count ?? 0);
  }

  async createInvitation(invitation: DatabaseInvitation): Promise<void> {
    await this.connect();
    this.getDb()
      .prepare(
        'INSERT INTO invitation (id, organizationId, email, role, status, inviterId, expiresAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .run(
        invitation.id,
        invitation.organizationId,
        invitation.email.toLowerCase(),
        invitation.role,
        invitation.status,
        invitation.inviterId,
        invitation.expiresAt,
        invitation.createdAt
      );
  }

  async getInvitation(invitationId: string): Promise<DatabaseInvitation | null> {
    await this.connect();
    const row = this.getDb()
      .prepare(
        'SELECT id, organizationId, email, role, status, inviterId, expiresAt, createdAt FROM invitation WHERE id = ?'
      )
      .get(invitationId) as DatabaseInvitation | undefined;
    return row ?? null;
  }

  async updateInvitation(
    invitationId: string,
    values: Partial<Pick<DatabaseInvitation, 'status' | 'expiresAt'>>
  ): Promise<void> {
    await this.connect();
    if (values.status)
      this.getDb()
        .prepare("UPDATE invitation SET status = ? WHERE id = ? AND status = 'pending'")
        .run(values.status, invitationId);
    if (values.expiresAt)
      this.getDb()
        .prepare("UPDATE invitation SET expiresAt = ? WHERE id = ? AND status = 'pending'")
        .run(values.expiresAt, invitationId);
  }

  async acceptPendingInvitation(
    invitationId: string,
    userId: string,
    now: string
  ): Promise<DatabaseInvitation | null> {
    await this.connect();
    const db = this.getDb();
    db.prepare('BEGIN IMMEDIATE').run();
    try {
      const result = db
        .prepare(
          "UPDATE invitation SET status = 'accepted' WHERE id = ? AND status = 'pending' AND datetime(expiresAt) > datetime(?)"
        )
        .run(invitationId, now);
      if (Number(result.changes ?? 0) !== 1) {
        db.prepare('ROLLBACK').run();
        return null;
      }
      const invitation = db
        .prepare(
          'SELECT id, organizationId, email, role, status, inviterId, expiresAt, createdAt FROM invitation WHERE id = ?'
        )
        .get(invitationId) as DatabaseInvitation;
      const existing = db
        .prepare('SELECT id FROM member WHERE organizationId = ? AND userId = ?')
        .get(invitation.organizationId, userId) as { id: string } | undefined;
      if (existing) {
        db.prepare('UPDATE member SET role = ? WHERE id = ?').run(invitation.role, existing.id);
      } else {
        db.prepare(
          'INSERT INTO member (id, organizationId, userId, role, createdAt) VALUES (?, ?, ?, ?, ?)'
        ).run(this.generateId(), invitation.organizationId, userId, invitation.role, now);
      }
      db.prepare('COMMIT').run();
      return invitation;
    } catch (error) {
      try {
        db.prepare('ROLLBACK').run();
      } catch {
        // Preserve original database error.
      }
      throw error;
    }
  }

  async listInvitations(orgId: string): Promise<DatabaseInvitation[]> {
    await this.connect();
    return this.getDb()
      .prepare(
        'SELECT id, organizationId, email, role, status, inviterId, expiresAt, createdAt FROM invitation WHERE organizationId = ? ORDER BY createdAt DESC'
      )
      .all(orgId) as DatabaseInvitation[];
  }

  async getUsersForAdmin(): Promise<AdminUserView[]> {
    await this.connect();
    const stmt = this.getDb().prepare(
      `SELECT 
        u.id, u.email, u.name, u.createdAt, u.updatedAt,
        COALESCE(m.role, 'viewer') as role
       FROM user u
       LEFT JOIN member m ON u.id = m.userId
       ORDER BY u.createdAt DESC`
    );
    return stmt.all() as AdminUserView[];
  }

  async getUserDetails(userId: string): Promise<AdminUserDetailsView | null> {
    await this.connect();
    const stmt = this.getDb().prepare(
      `SELECT 
        u.id, u.email, u.name, u.createdAt, u.updatedAt,
        COALESCE(m.role, 'viewer') as role,
        m.organizationId
       FROM user u
       LEFT JOIN member m ON u.id = m.userId
       WHERE u.id = ?`
    );
    const row = stmt.get(userId) as AdminUserDetailsView | undefined;
    return row ?? null;
  }
}
