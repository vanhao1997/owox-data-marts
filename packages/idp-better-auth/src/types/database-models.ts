/**
 * Database user model
 */
export interface DatabaseUser {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
}

/**
 * Database session model
 */
export interface DatabaseSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt?: string;
}

/**
 * Database account model
 */
export interface DatabaseAccount {
  id: string;
  userId: string;
  providerId: string;
  accountId: string;
  createdAt?: string;
}

/**
 * Database organization member model
 */
export interface DatabaseMember {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt?: string;
  user?: DatabaseUser;
}

export interface DatabaseOrganization {
  id: string;
  name: string;
  slug: string;
  metadata?: string | null;
  createdAt?: string;
}

export interface DatabaseInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'rejected' | 'canceled';
  inviterId: string;
  expiresAt: string;
  createdAt: string;
}

/**
 * Organization list members response
 */
export interface OrganizationMembersResponse {
  members: DatabaseMember[];
}

/**
 * Database operation result
 */
export interface DatabaseOperationResult {
  changes: number;
  lastInsertRowid?: number;
}

/**
 * Admin users list view
 */
export interface AdminUserView {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * Admin user details view
 */
export interface AdminUserDetailsView {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string | null;
  organizationId: string | null;
  hasPassword?: boolean;
}
