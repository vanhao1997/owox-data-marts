import React, { useCallback, useEffect, useReducer } from 'react';
import {
  getProjectsApi,
  createProjectApi,
  renameProjectApi,
  archiveProjectApi,
  unarchiveProjectApi,
  selectProjectApi,
} from '../services';
import type { Projects } from '../types';
import { getTokenProvider } from '../../../app/api/token-provider';
import { RequestStatus } from '../../../shared/types/request-status.ts';
import { type ApiError, extractApiError } from '../../../app/api';
import type { ProjectsContextType, ProjectsState } from './ProjectContext.types.ts';
import { ProjectsContext } from '../hooks/useProjects.ts';
import { AxiosError } from 'axios';
import { useAuth } from '../hooks/useAuth';
import { AuthStatus } from '../types';

const initialState: ProjectsState = {
  projects: [],
  callState: RequestStatus.IDLE,
  error: null,
};

type Action =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; payload: Projects }
  | { type: 'ERROR'; payload: ApiError }
  | { type: 'RESET' };

function reducer(state: ProjectsState, action: Action): ProjectsState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, callState: RequestStatus.LOADING, error: null };
    case 'SUCCESS':
      return { projects: action.payload, callState: RequestStatus.LOADED, error: null };
    case 'ERROR':
      return { ...state, callState: RequestStatus.ERROR, error: action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { status: authStatus, session, refreshToken } = useAuth();

  const loadProjects = useCallback(async () => {
    dispatch({ type: 'LOADING' });
    try {
      const provider = getTokenProvider();
      const token = provider?.getAccessToken() ?? session?.accessToken ?? null;
      if (!token) {
        dispatch({ type: 'ERROR', payload: extractApiError(new AxiosError('No token provider')) });
        return;
      }

      const projects = await getProjectsApi(token);
      dispatch({ type: 'SUCCESS', payload: projects });
    } catch (e) {
      dispatch({ type: 'ERROR', payload: extractApiError(e) });
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (
      (authStatus === AuthStatus.UNAUTHENTICATED || authStatus === AuthStatus.ERROR) &&
      state.callState !== RequestStatus.IDLE
    ) {
      dispatch({ type: 'RESET' });
      return;
    }
    if (
      authStatus === AuthStatus.AUTHENTICATED &&
      session?.accessToken &&
      state.callState === RequestStatus.IDLE
    ) {
      void loadProjects();
    }
  }, [authStatus, session?.accessToken, state.callState, loadProjects]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);
  const reload = loadProjects;
  const createProject = useCallback(
    async (name: string) => {
      const project = await createProjectApi(name);
      await loadProjects();
      return project;
    },
    [loadProjects]
  );
  const renameProject = useCallback(
    async (projectId: string, name: string) => {
      const project = await renameProjectApi(projectId, name);
      await loadProjects();
      return project;
    },
    [loadProjects]
  );
  const archiveProject = useCallback(
    async (projectId: string) => {
      const project = await archiveProjectApi(projectId);
      // Archiving the active project may switch Better Auth's active
      // organization to another membership; refresh the OWOX token before
      // rendering project-scoped routes.
      await refreshToken();
      await loadProjects();
      return project;
    },
    [loadProjects, refreshToken]
  );
  const unarchiveProject = useCallback(
    async (projectId: string) => {
      const project = await unarchiveProjectApi(projectId);
      await loadProjects();
      return project;
    },
    [loadProjects]
  );
  const selectProject = useCallback(
    async (projectId: string) => {
      const project = await selectProjectApi(projectId);
      // Selection changes Better Auth's active organization cookie. Refresh the
      // OWOX token before callers navigate so project-scoped API requests use the
      // newly selected membership immediately.
      await refreshToken();
      await loadProjects();
      return project;
    },
    [loadProjects, refreshToken]
  );
  const isLoading = state.callState === RequestStatus.LOADING;

  const value: ProjectsContextType = {
    ...state,
    loadProjects,
    reload,
    createProject,
    renameProject,
    archiveProject,
    unarchiveProject,
    selectProject,
    reset,
    isLoading,
  };

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}
