import type { Projects } from '../types';
import { RequestStatus } from '../../../shared/types/request-status.ts';
import type { ApiError } from '../../../app/api';
import type { Project } from '../types';

export interface ProjectsState {
  projects: Projects;
  callState: RequestStatus;
  error: ApiError | null;
}

export interface ProjectsActions {
  loadProjects: () => Promise<void>;
  reset: () => void;
  reload: () => Promise<void>;
  createProject: (name: string) => Promise<Project>;
  renameProject: (projectId: string, name: string) => Promise<Project>;
  archiveProject: (projectId: string) => Promise<Project>;
  unarchiveProject: (projectId: string) => Promise<Project>;
  selectProject: (projectId: string) => Promise<Project>;
}

export type ProjectsContextType = ProjectsState & ProjectsActions & { isLoading: boolean };
