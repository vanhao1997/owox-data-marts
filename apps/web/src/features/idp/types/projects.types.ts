export type ProjectStatus = 'active' | 'blocked' | 'removed';
export type ProjectRole = 'admin' | 'editor' | 'viewer';

export interface Project {
  id: string;
  title: string;
  status?: ProjectStatus;
  roles?: ProjectRole[];
  createdAt?: string;
  archived?: boolean;
}

export type Projects = Project[];
