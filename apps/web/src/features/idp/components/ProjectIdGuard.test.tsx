import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../types';
import type { ProjectsContextType } from '../context/ProjectContext.types';
import { ProjectIdGuard } from './ProjectIdGuard';

const auth = vi.hoisted(() => ({ isLoading: false, user: null as User | null }));
const projects = vi.hoisted(() => ({
  projects: [] as ProjectsContextType['projects'],
  callState: 'loading',
  selectProject: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('../hooks', () => ({
  useAuthState: () => ({ isLoading: auth.isLoading }),
  useUser: () => auth.user,
  useProjects: () => projects,
}));

vi.mock('../../../app/store/hooks', () => ({
  useFlags: () => ({ flags: { IDP_PROVIDER: 'better-auth' } }),
}));

vi.mock('@owox/ui/components/common/loading-spinner', () => ({
  FullScreenLoader: () => <div data-testid='loader'>Loading</div>,
}));

vi.mock('react-router', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => navigate };
});

describe('ProjectIdGuard', () => {
  beforeEach(() => {
    auth.isLoading = false;
    auth.user = user('project-1');
    projects.projects = [];
    projects.callState = 'loading';
    projects.selectProject.mockReset();
    projects.selectProject.mockResolvedValue({ id: 'project-2', title: 'Project 2' });
    navigate.mockReset();
  });

  it('waits for project memberships before redirecting an unfamiliar URL project', () => {
    renderGuard('/ui/project-2/data-marts');

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('redirects to project management after loaded memberships reject URL project', async () => {
    projects.callState = 'loaded';
    renderGuard('/ui/project-2/data-marts');

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/projects', { replace: true });
    });
  });
});

function renderGuard(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path='/ui/:projectId/*'
          element={
            <ProjectIdGuard>
              <div data-testid='content'>Content</div>
            </ProjectIdGuard>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

function user(projectId: string): User {
  return {
    id: 'user-1',
    email: 'user@example.com',
    projectId,
    roles: ['viewer'],
  };
}
