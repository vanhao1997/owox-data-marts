import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useAuthState, useUser, useProjects } from '../hooks';
import { useNavigate } from 'react-router';
import { normalizeProjectId } from '../utils/project-id';
import { FullScreenLoader } from '@owox/ui/components/common/loading-spinner';
import { RequestStatus } from '../../../shared/types/request-status';
import { useFlags } from '../../../app/store/hooks';
import { checkVisible } from '../../../utils/check-visible';
import { signIn } from '../services';

/**
 * A React component that acts as a guard to ensure the user is accessing the correct project ID,
 * redirecting them to the authentication sign-in page if there's a mismatch between the URL's
 * project ID and the user's assigned project ID.
 *
 * @param {Object} props - The props object.
 * @param {React.ReactNode} props.children - The child components to render within the guard.
 * @return {React.ReactElement} Returns the rendered child elements if the guard conditions pass.
 */
export function ProjectIdGuard({ children }: { children: React.ReactNode }): React.ReactElement {
  const { isLoading } = useAuthState();
  const user = useUser();
  const { projectId: urlProjectId } = useParams<{ projectId?: string }>();

  const userProjectId = user?.projectId;
  const { projects, selectProject, callState } = useProjects();
  const { flags } = useFlags();
  const navigate = useNavigate();
  const safeUrlProjectId = normalizeProjectId(urlProjectId);
  const usesLocalProjectManagement = checkVisible('IDP_PROVIDER', 'better-auth', flags);

  const hasMismatch =
    !isLoading && !!safeUrlProjectId && !!userProjectId && userProjectId !== safeUrlProjectId;
  const projectsLoaded = callState === RequestStatus.LOADED || callState === RequestStatus.ERROR;

  useEffect(() => {
    if (!hasMismatch) return;
    // The managed OWOX provider still owns project selection in its sign-in
    // flow. Only self-hosted Better Auth exposes the local selection endpoint.
    if (!usesLocalProjectManagement) {
      signIn({ projectId: safeUrlProjectId });
      return;
    }
    if (!projectsLoaded) return;
    const project = projects.find(item => item.id === safeUrlProjectId);
    if (!project) {
      void navigate('/projects', { replace: true });
      return;
    }
    void selectProject(safeUrlProjectId)
      .then(() => {
        window.location.reload();
      })
      .catch(() => {
        void navigate('/projects', { replace: true });
      });
  }, [
    hasMismatch,
    projectsLoaded,
    safeUrlProjectId,
    projects,
    selectProject,
    navigate,
    usesLocalProjectManagement,
  ]);

  if (isLoading || (hasMismatch && !projectsLoaded) || (hasMismatch && projectsLoaded)) {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
}
