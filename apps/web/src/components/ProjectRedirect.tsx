import { Navigate } from 'react-router';
import { useAuth } from '../features/idp';
import { AuthStatus } from '../features/idp/types';
import { LoadingSpinner } from '@owox/ui/components/common/loading-spinner';
import { useTranslation } from 'react-i18next';
import { buildProjectPath } from '../utils/path';
import { buildProjectRequestAccessPath } from '../features/user-provisioning/utils/request-access-routing';

/**
 * Component that redirects to the project-scoped route
 * Used for root path redirect
 */
export function ProjectRedirect({ to = '/data-marts' }: { to?: string }) {
  const { user, status } = useAuth();
  const { t } = useTranslation();

  if (status === AuthStatus.LOADING) {
    return <LoadingSpinner fullScreen message={t('common.loading', 'Loading...')} />;
  }

  if (status === AuthStatus.UNAUTHENTICATED || !user) {
    return <LoadingSpinner fullScreen message={t('projectRedirect.auth', 'Authentication...')} />;
  }

  if (Array.isArray(user.roles) && user.roles.length === 0) {
    if (!user.projectId) {
      return <Navigate to='/projects' replace />;
    }
    const redirectTo = buildProjectPath(user.projectId, to);
    return <Navigate to={buildProjectRequestAccessPath(user.projectId, redirectTo)} replace />;
  }

  if (user.projectId) {
    const projectPath = buildProjectPath(user.projectId, to);
    return <Navigate to={projectPath} replace />;
  }

  return <LoadingSpinner fullScreen message={t('projectRedirect.notFound', 'Project not found')} />;
}
