import type { ReactNode } from 'react';
import { AuthGuard } from '../features/idp';
import { ProjectIdGuard } from '../features/idp/components/ProjectIdGuard';
import { ProjectRoleGuard } from '../features/idp/components/ProjectRoleGuard';

/**
 * The auth/project guard chain shared by every authenticated `/ui/:projectId/...` layout:
 * sign-in required, active project re-synced to the URL's :projectId (with a transparent
 * re-auth if it doesn't match the current session), non-members routed to request-access.
 * Extracted out of MainLayout so minimal, chrome-free layouts (e.g. ConnectFlowLayout) can
 * reuse the same guarantees without pulling in the sidebar/nav chrome.
 */
export function ProjectAuthGuards({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <ProjectIdGuard>
        <ProjectRoleGuard>{children}</ProjectRoleGuard>
      </ProjectIdGuard>
    </AuthGuard>
  );
}
