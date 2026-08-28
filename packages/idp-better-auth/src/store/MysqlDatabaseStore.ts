import { randomUUID } from 'crypto';
import { Logger, LoggerFactory } from '@owox/internal-helpers';
import type {
  DatabaseOperationResult,
  DatabaseUser,
  AdminUserDetailsView,
  AdminUserView,
  Role,
  DatabaseMember,
  DatabaseOrganization,
  DatabaseInvitation,
} from '../types/index.js';
import type { DatabaseStore } from './DatabaseStore.js';

type MysqlExecResult = { affectedRows?: number };
type MysqlRows = [Array<Record<string, unknown>>, unknown];
type MysqlPool = {
  query: (sql: string, params?: unknown[]) => Promise<[Array<Record<string, unknown>>, unknown]>;
  execute: (
    sql: string,
    params?: unknown[]
  ) => Promise<[Array<Record<string, unknown>> | MysqlExecResult, unknown]>;
  getConnection?: () => Promise<MysqlConnection>;
  end?: () => Promise<void>;
};

type MysqlConnection = {
  execute: MysqlPool['execute'];
  release: () => void;
};

export interface MysqlConnectionConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
  ssl?: unknown;
}

export class MysqlDatabaseStore implements DatabaseStore {
  private pool?: MysqlPool;
  private readonly logger: Logger;

  constructor(private readonly config: MysqlConnectionConfig) {
    this.logger = LoggerFactory.createNamedLogger('BetterAuthMysqlDatabaseStore');
  }

  private async getPool(): Promise<MysqlPool> {
    if (this.pool) return this.pool;

    try {
      const mysql = await import('mysql2/promise');

      this.pool = (
        mysql as { default: { createPool: (config: unknown) => unknown } }
      ).default.createPool({
        host: this.config.host,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        port: this.config.port || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: this.config.ssl,
      }) as MysqlPool;
    } catch (error) {
      this.logger.error('Failed to initialize MySQL pool', { error });
      throw new Error('mysql2 is required for MySQL support. Install it with: npm install mysql2');
    }

    return this.pool;
  }

  private toIso(val: unknown): string | null {
    if (val == null) return null;
    if (val instanceof Date) return val.toISOString();
    return String(val);
  }

  private generateId(): string {
    return randomUUID();
  }

  async isHealthy(): Promise<boolean> {
    try {
      const pool = await this.getPool();
      await pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async cleanupExpiredSessions(): Promise<DatabaseOperationResult> {
    const pool = await this.getPool();
    const [result] = (await pool.execute('DELETE FROM session WHERE expiresAt < NOW()')) as [
      MysqlExecResult,
      unknown,
    ];
    return { changes: Number((result as MysqlExecResult)?.affectedRows ?? 0) };
  }

  async getUserCount(): Promise<number> {
    const pool = await this.getPool();
    const [rows] = (await pool.query('SELECT COUNT(*) as count FROM user')) as [
      Array<Record<string, unknown>>,
      unknown,
    ];
    const row = rows[0] as Record<string, unknown> & { count?: number };
    return row?.count ?? 0;
  }

  async getUsers(): Promise<DatabaseUser[]> {
    const pool = await this.getPool();
    const [rows] = (await pool.query(
      'SELECT id, email, name, createdAt FROM user ORDER BY createdAt DESC'
    )) as [Array<Record<string, unknown>>, unknown];
    return (rows as Array<Record<string, unknown>>).map((r: Record<string, unknown>) => ({
      id: String(r.id),
      email: String(r.email),
      name: r.name != null ? String(r.name) : undefined,
      createdAt: this.toIso(r.createdAt) ?? undefined,
    }));
  }

  async getUserById(userId: string): Promise<DatabaseUser | null> {
    const pool = await this.getPool();
    const [rows] = (await pool.execute(
      'SELECT id, email, name, createdAt FROM user WHERE id = ? LIMIT 1',
      [userId]
    )) as [Array<Record<string, unknown>>, unknown];
    const r = (rows as Array<Record<string, unknown>>)[0];
    if (!r) return null;
    return {
      id: String(r.id),
      email: String(r.email),
      name: r.name != null ? String(r.name) : undefined,
      createdAt: this.toIso(r.createdAt) ?? undefined,
    };
  }

  async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    const pool = await this.getPool();
    const [rows] = (await pool.execute(
      'SELECT id, email, name, createdAt FROM user WHERE LOWER(email) = LOWER(?) LIMIT 1',
      [email.trim()]
    )) as [Array<Record<string, unknown>>, unknown];
    const r = (rows as Array<Record<string, unknown>>)[0];
    if (!r) return null;
    return {
      id: String(r.id),
      email: String(r.email),
      name: r.name != null ? String(r.name) : undefined,
      createdAt: this.toIso(r.createdAt) ?? undefined,
    };
  }

  async createUserStub(
    email: string,
    name?: string
  ): Promise<{ userId: string; created: boolean }> {
    const pool = await this.getPool();
    const normalizedEmail = email.trim().toLowerCase();

    const [existingRows] = (await pool.execute(
      'SELECT id FROM user WHERE LOWER(email) = LOWER(?) LIMIT 1',
      [normalizedEmail]
    )) as MysqlRows;
    const existing = (existingRows as Array<Record<string, unknown>>)[0];
    if (existing) {
      return { userId: String(existing.id), created: false };
    }

    const userId = randomUUID();
    const now = new Date();
    await pool.execute(
      'INSERT INTO user (id, email, emailVerified, name, createdAt, updatedAt) VALUES (?, ?, 0, ?, ?, ?)',
      [userId, normalizedEmail, name ?? '', now, now]
    );
    return { userId, created: true };
  }

  async userHasPassword(userId: string): Promise<boolean> {
    const pool = await this.getPool();
    try {
      const [rows] = (await pool.execute(
        "SELECT password FROM account WHERE userId = ? AND providerId = 'credential' LIMIT 1",
        [userId]
      )) as [Array<Record<string, unknown>>, unknown];
      const r = (rows as Array<Record<string, unknown>>)[0];
      return !!(r?.password && String(r.password).length > 0);
    } catch {
      return false;
    }
  }

  async clearUserPassword(userId: string): Promise<void> {
    const pool = await this.getPool();
    try {
      await pool.execute("DELETE FROM account WHERE userId = ? AND providerId = 'credential'", [
        userId,
      ]);
    } catch {
      // Non-fatal: account might not exist
    }
  }

  async revokeUserSessions(userId: string): Promise<void> {
    const pool = await this.getPool();
    try {
      await pool.execute('DELETE FROM session WHERE userId = ?', [userId]);
    } catch (error) {
      // A zero-row delete does not throw, so this catch only fires on a real DB
      // failure. A silently failed session revoke is a security-relevant event,
      // so log it rather than swallowing.
      this.logger.error('Failed to revoke user sessions', { userId, error });
    }
  }

  async revokeOtherUserSessions(userId: string, exceptSessionToken: string): Promise<void> {
    const pool = await this.getPool();
    try {
      await pool.execute('DELETE FROM session WHERE userId = ? AND token != ?', [
        userId,
        exceptSessionToken,
      ]);
    } catch (error) {
      this.logger.error('Failed to revoke other user sessions', { userId, error });
    }
  }

  async updateUserName(userId: string, name: string): Promise<void> {
    const pool = await this.getPool();
    const [res] = (await pool.execute('UPDATE user SET name = ? WHERE id = ?', [name, userId])) as [
      MysqlExecResult,
      unknown,
    ];
    if (!(res as MysqlExecResult)?.affectedRows)
      throw new Error(`User ${userId} not found or not updated`);
  }

  async deleteUserCascade(userId: string): Promise<DatabaseOperationResult> {
    const pool = await this.getPool();
    try {
      try {
        await pool.execute('DELETE FROM session WHERE userId = ?', [userId]);
      } catch (error) {
        // Continue the cascade, but a failed session removal is security-relevant
        // (orphaned sessions could outlive the user) — log rather than swallow.
        this.logger.error('Failed to delete user sessions during cascade', { userId, error });
      }
      try {
        await pool.execute('DELETE FROM account WHERE userId = ?', [userId]);
      } catch (error) {
        this.logger.error('Failed to delete user accounts during cascade', { userId, error });
      }
      try {
        await pool.execute('DELETE FROM member WHERE userId = ?', [userId]);
      } catch (error) {
        this.logger.error('Failed to delete user memberships during cascade', { userId, error });
      }
      const [res] = (await pool.execute('DELETE FROM user WHERE id = ?', [userId])) as [
        MysqlExecResult,
        unknown,
      ];
      if (!(res as MysqlExecResult)?.affectedRows) throw new Error(`User ${userId} not found`);
      return { changes: Number((res as MysqlExecResult).affectedRows ?? 0) };
    } catch (e) {
      throw new Error(
        `Failed to delete user ${userId}: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  async defaultOrganizationExists(slug: string): Promise<boolean> {
    const pool = await this.getPool();
    const [rows] = (await pool.execute('SELECT id FROM organization WHERE slug = ? LIMIT 1', [
      slug,
    ])) as [Array<Record<string, unknown>>, unknown];
    return (rows as Array<Record<string, unknown>>).length > 0;
  }

  async createDefaultOrganizationForUser(
    org: { id: string; name: string; slug: string },
    userId: string,
    role: Role
  ): Promise<void> {
    const pool = await this.getPool();
    const now = new Date();
    try {
      await pool.execute(
        'INSERT INTO organization (id, name, slug, metadata, createdAt) VALUES (?, ?, ?, ?, ?)',
        [org.id, org.name, org.slug, JSON.stringify({ isDefault: true, createdBy: userId }), now]
      );
      await pool.execute(
        'INSERT INTO member (id, organizationId, userId, role, createdAt) VALUES (?, ?, ?, ?, ?)',
        [this.generateId(), org.id, userId, role, now]
      );
    } catch (err) {
      const msg = String(err).toLowerCase();
      if (msg.includes('duplicate') || msg.includes('unique')) {
        await this.addUserToOrganization(org.id, userId, role);
        return;
      }
      throw err;
    }
  }

  async addUserToOrganization(orgId: string, userId: string, role: Role): Promise<void> {
    const pool = await this.getPool();
    const [rows] = (await pool.execute(
      'SELECT role FROM member WHERE userId = ? AND organizationId = ?',
      [userId, orgId]
    )) as [Array<Record<string, unknown>>, unknown];
    if ((rows as Array<Record<string, unknown>>).length > 0) {
      await pool.execute('UPDATE member SET role = ? WHERE userId = ? AND organizationId = ?', [
        role,
        userId,
        orgId,
      ]);
    } else {
      const now = new Date();
      await pool.execute(
        'INSERT INTO member (id, organizationId, userId, role, createdAt) VALUES (?, ?, ?, ?, ?)',
        [this.generateId(), orgId, userId, role, now]
      );
    }
  }

  async getUserRole(orgId: string, userId: string): Promise<string | null> {
    const pool = await this.getPool();
    const [rows] = (await pool.execute(
      'SELECT role FROM member WHERE userId = ? AND organizationId = ? LIMIT 1',
      [userId, orgId]
    )) as [Array<Record<string, unknown>>, unknown];
    const list = rows as Array<Record<string, unknown>>;
    if (list.length === 0) return null;
    const first = list[0] as Record<string, unknown>;
    return String(first.role);
  }

  async listOrganizationsForUser(userId: string): Promise<DatabaseOrganization[]> {
    const pool = await this.getPool();
    const [rows] = (await pool.execute(
      `SELECT o.id, o.name, o.slug, o.metadata, o.createdAt
       FROM organization o INNER JOIN member m ON m.organizationId = o.id
       WHERE m.userId = ? ORDER BY o.createdAt ASC`,
      [userId]
    )) as [Array<Record<string, unknown>>, unknown];
    return rows.map(r => ({
      id: String(r.id),
      name: String(r.name),
      slug: String(r.slug),
      metadata: r.metadata == null ? null : String(r.metadata),
      createdAt: this.toIso(r.createdAt) ?? undefined,
    }));
  }

  async getOrganization(orgId: string): Promise<DatabaseOrganization | null> {
    const pool = await this.getPool();
    const [rows] = (await pool.execute(
      'SELECT id, name, slug, metadata, createdAt FROM organization WHERE id = ? LIMIT 1',
      [orgId]
    )) as [Array<Record<string, unknown>>, unknown];
    const r = rows[0];
    if (!r) return null;
    return {
      id: String(r.id),
      name: String(r.name),
      slug: String(r.slug),
      metadata: r.metadata == null ? null : String(r.metadata),
      createdAt: this.toIso(r.createdAt) ?? undefined,
    };
  }

  async createOrganization(org: DatabaseOrganization, userId: string, role: Role): Promise<void> {
    const pool = await this.getPool();
    const now = new Date();
    if (!pool.getConnection) {
      const [rows] = (await pool.execute('SELECT COUNT(*) as count FROM member WHERE userId = ?', [
        userId,
      ])) as [Array<Record<string, unknown>>, unknown];
      if (Number(rows[0]?.count ?? 0) >= 20) throw new Error('Project limit reached');
      await pool.execute(
        'INSERT INTO organization (id, name, slug, metadata, createdAt) VALUES (?, ?, ?, ?, ?)',
        [
          org.id,
          org.name,
          org.slug,
          org.metadata ?? null,
          org.createdAt ? new Date(org.createdAt) : now,
        ]
      );
      await pool.execute(
        'INSERT INTO member (id, organizationId, userId, role, createdAt) VALUES (?, ?, ?, ?, ?)',
        [this.generateId(), org.id, userId, role, now]
      );
      return;
    }
    const connection = await pool.getConnection();
    await connection.execute('START TRANSACTION');
    try {
      // Serialize project creation for this user so concurrent requests cannot
      // pass the 20-project limit check together.
      await connection.execute('SELECT id FROM user WHERE id = ? FOR UPDATE', [userId]);
      const [rows] = (await connection.execute(
        'SELECT COUNT(*) as count FROM member WHERE userId = ?',
        [userId]
      )) as [Array<Record<string, unknown>>, unknown];
      if (Number(rows[0]?.count ?? 0) >= 20) throw new Error('Project limit reached');
      await connection.execute(
        'INSERT INTO organization (id, name, slug, metadata, createdAt) VALUES (?, ?, ?, ?, ?)',
        [
          org.id,
          org.name,
          org.slug,
          org.metadata ?? null,
          org.createdAt ? new Date(org.createdAt) : now,
        ]
      );
      await connection.execute(
        'INSERT INTO member (id, organizationId, userId, role, createdAt) VALUES (?, ?, ?, ?, ?)',
        [this.generateId(), org.id, userId, role, now]
      );
      await connection.execute('COMMIT');
    } catch (error) {
      try {
        await connection.execute('ROLLBACK');
      } catch {
        // Preserve the original storage error.
      }
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateOrganization(orgId: string, name: string, metadata?: string | null): Promise<void> {
    const pool = await this.getPool();
    const [result] = (await pool.execute(
      'UPDATE organization SET name = ?, metadata = COALESCE(?, metadata) WHERE id = ?',
      [name, metadata ?? null, orgId]
    )) as [MysqlExecResult, unknown];
    if (!result.affectedRows) throw new Error(`Organization ${orgId} not found`);
  }

  async listOrganizationMembers(orgId: string): Promise<DatabaseMember[]> {
    const pool = await this.getPool();
    const [rows] = (await pool.execute(
      `SELECT m.id, m.organizationId, m.userId, m.role, m.createdAt,
              u.id as user_id, u.email as user_email, u.name as user_name
       FROM member m INNER JOIN user u ON u.id = m.userId
       WHERE m.organizationId = ? ORDER BY m.createdAt ASC`,
      [orgId]
    )) as [Array<Record<string, unknown>>, unknown];
    return rows.map(row => ({
      id: String(row.id),
      organizationId: String(row.organizationId),
      userId: String(row.userId),
      role: String(row.role),
      createdAt: this.toIso(row.createdAt) ?? undefined,
      user: {
        id: String(row.user_id),
        email: String(row.user_email),
        name: row.user_name == null ? undefined : String(row.user_name),
      },
    }));
  }

  async removeUserFromOrganization(orgId: string, userId: string): Promise<void> {
    const pool = await this.getPool();
    await pool.execute('DELETE FROM member WHERE organizationId = ? AND userId = ?', [
      orgId,
      userId,
    ]);
  }

  async countOrganizationsForUser(userId: string): Promise<number> {
    const pool = await this.getPool();
    const [rows] = (await pool.execute('SELECT COUNT(*) as count FROM member WHERE userId = ?', [
      userId,
    ])) as [Array<Record<string, unknown>>, unknown];
    return Number(rows[0]?.count ?? 0);
  }

  async createInvitation(invitation: DatabaseInvitation): Promise<void> {
    const pool = await this.getPool();
    await pool.execute(
      'INSERT INTO invitation (id, organizationId, email, role, status, inviterId, expiresAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        invitation.id,
        invitation.organizationId,
        invitation.email.toLowerCase(),
        invitation.role,
        invitation.status,
        invitation.inviterId,
        new Date(invitation.expiresAt),
        new Date(invitation.createdAt),
      ]
    );
  }

  async getInvitation(invitationId: string): Promise<DatabaseInvitation | null> {
    const pool = await this.getPool();
    const [rows] = (await pool.execute(
      'SELECT id, organizationId, email, role, status, inviterId, expiresAt, createdAt FROM invitation WHERE id = ? LIMIT 1',
      [invitationId]
    )) as [Array<Record<string, unknown>>, unknown];
    const r = rows[0];
    if (!r) return null;
    return {
      id: String(r.id),
      organizationId: String(r.organizationId),
      email: String(r.email),
      role: String(r.role) as Role,
      status: String(r.status) as DatabaseInvitation['status'],
      inviterId: String(r.inviterId),
      expiresAt: this.toIso(r.expiresAt) ?? '',
      createdAt: this.toIso(r.createdAt) ?? '',
    };
  }

  async updateInvitation(
    invitationId: string,
    values: Partial<Pick<DatabaseInvitation, 'status' | 'expiresAt'>>
  ): Promise<void> {
    const pool = await this.getPool();
    if (values.status)
      await pool.execute("UPDATE invitation SET status = ? WHERE id = ? AND status = 'pending'", [
        values.status,
        invitationId,
      ]);
    if (values.expiresAt)
      await pool.execute(
        "UPDATE invitation SET expiresAt = ? WHERE id = ? AND status = 'pending'",
        [new Date(values.expiresAt), invitationId]
      );
  }

  async acceptPendingInvitation(
    invitationId: string,
    userId: string,
    now: string
  ): Promise<DatabaseInvitation | null> {
    const pool = await this.getPool();
    if (!pool.getConnection) {
      const [result] = (await pool.execute(
        "UPDATE invitation SET status = 'accepted' WHERE id = ? AND status = 'pending' AND expiresAt > ?",
        [invitationId, new Date(now)]
      )) as [MysqlExecResult, unknown];
      if (Number(result.affectedRows ?? 0) !== 1) return null;
      const invitation = await this.getInvitation(invitationId);
      if (!invitation) return null;
      await this.addUserToOrganization(invitation.organizationId, userId, invitation.role);
      return invitation;
    }
    const connection = await pool.getConnection();
    await connection.execute('START TRANSACTION');
    try {
      const [result] = (await connection.execute(
        "UPDATE invitation SET status = 'accepted' WHERE id = ? AND status = 'pending' AND expiresAt > ?",
        [invitationId, new Date(now)]
      )) as [MysqlExecResult, unknown];
      if (Number(result.affectedRows ?? 0) !== 1) {
        await connection.execute('ROLLBACK');
        connection.release();
        return null;
      }
      const [rows] = (await connection.execute(
        'SELECT id, organizationId, email, role, status, inviterId, expiresAt, createdAt FROM invitation WHERE id = ? LIMIT 1',
        [invitationId]
      )) as [Array<Record<string, unknown>>, unknown];
      const row = rows[0];
      const invitation = row
        ? {
            id: String(row.id),
            organizationId: String(row.organizationId),
            email: String(row.email),
            role: String(row.role) as Role,
            status: String(row.status) as DatabaseInvitation['status'],
            inviterId: String(row.inviterId),
            expiresAt: this.toIso(row.expiresAt) ?? '',
            createdAt: this.toIso(row.createdAt) ?? '',
          }
        : null;
      if (!invitation) {
        await connection.execute('ROLLBACK');
        connection.release();
        return null;
      }
      const [members] = (await connection.execute(
        'SELECT id FROM member WHERE organizationId = ? AND userId = ? LIMIT 1',
        [invitation.organizationId, userId]
      )) as [Array<Record<string, unknown>>, unknown];
      const existingMember = members[0];
      if (existingMember) {
        await connection.execute('UPDATE member SET role = ? WHERE id = ?', [
          invitation.role,
          String(existingMember.id),
        ]);
      } else {
        await connection.execute(
          'INSERT INTO member (id, organizationId, userId, role, createdAt) VALUES (?, ?, ?, ?, ?)',
          [this.generateId(), invitation.organizationId, userId, invitation.role, new Date(now)]
        );
      }
      await connection.execute('COMMIT');
      connection.release();
      return invitation;
    } catch (error) {
      try {
        await connection.execute('ROLLBACK');
      } catch {
        // Preserve original database error.
      }
      connection.release();
      throw error;
    }
  }

  async listInvitations(orgId: string): Promise<DatabaseInvitation[]> {
    const pool = await this.getPool();
    const [rows] = (await pool.execute(
      'SELECT id, organizationId, email, role, status, inviterId, expiresAt, createdAt FROM invitation WHERE organizationId = ? ORDER BY createdAt DESC',
      [orgId]
    )) as [Array<Record<string, unknown>>, unknown];
    return rows.map(r => ({
      id: String(r.id),
      organizationId: String(r.organizationId),
      email: String(r.email),
      role: String(r.role) as Role,
      status: String(r.status) as DatabaseInvitation['status'],
      inviterId: String(r.inviterId),
      expiresAt: this.toIso(r.expiresAt) ?? '',
      createdAt: this.toIso(r.createdAt) ?? '',
    }));
  }

  async getUsersForAdmin(): Promise<AdminUserView[]> {
    const pool = await this.getPool();
    const [rows] = (await pool.query(
      `SELECT 
        u.id, u.email, u.name, u.createdAt, u.updatedAt,
        COALESCE(m.role, 'viewer') as role
       FROM user u
       LEFT JOIN member m ON u.id = m.userId
       ORDER BY u.createdAt DESC`
    )) as [Array<Record<string, unknown>>, unknown];
    return (rows as Array<Record<string, unknown>>).map((r: Record<string, unknown>) => ({
      id: String(r.id),
      email: String(r.email),
      name: r.name != null ? String(r.name) : null,
      role: String(r.role),
      createdAt: this.toIso(r.createdAt) ?? '',
      updatedAt: this.toIso(r.updatedAt),
    }));
  }

  async getUserDetails(userId: string): Promise<AdminUserDetailsView | null> {
    const pool = await this.getPool();
    const [rows] = (await pool.execute(
      `SELECT 
        u.id, u.email, u.name, u.createdAt, u.updatedAt,
        COALESCE(m.role, 'viewer') as role,
        m.organizationId
       FROM user u
       LEFT JOIN member m ON u.id = m.userId
       WHERE u.id = ?`,
      [userId]
    )) as [Array<Record<string, unknown>>, unknown];
    const r = (rows as Array<Record<string, unknown>>)[0];
    if (!r) return null;
    return {
      id: String(r.id),
      email: String(r.email),
      name: r.name != null ? String(r.name) : null,
      role: String(r.role),
      createdAt: this.toIso(r.createdAt) ?? '',
      updatedAt: this.toIso(r.updatedAt),
      organizationId: r.organizationId != null ? String(r.organizationId) : null,
    };
  }

  async shutdown(): Promise<void> {
    if (this.pool && typeof this.pool.end === 'function') {
      try {
        await this.pool.end();
      } catch (error) {
        this.logger.error('Failed to close MySQL pool', { error });
      } finally {
        this.pool = undefined;
      }
    }
  }

  async getAdapter(): Promise<unknown> {
    return await this.getPool();
  }
}
