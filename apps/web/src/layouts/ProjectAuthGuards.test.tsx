import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProjectAuthGuards } from './ProjectAuthGuards';

vi.mock('../features/idp', () => ({
  AuthGuard: ({ children }: { children: ReactNode }) => (
    <div data-testid='auth-guard'>{children}</div>
  ),
}));

vi.mock('../features/idp/components/ProjectIdGuard', () => ({
  ProjectIdGuard: ({ children }: { children: ReactNode }) => (
    <div data-testid='project-id-guard'>{children}</div>
  ),
}));

vi.mock('../features/idp/components/ProjectRoleGuard', () => ({
  ProjectRoleGuard: ({ children }: { children: ReactNode }) => (
    <div data-testid='project-role-guard'>{children}</div>
  ),
}));

describe('ProjectAuthGuards', () => {
  it('renders children through the full guard chain, in order', () => {
    render(
      <ProjectAuthGuards>
        <div data-testid='content'>Protected content</div>
      </ProjectAuthGuards>
    );

    const authGuard = screen.getByTestId('auth-guard');
    const projectIdGuard = screen.getByTestId('project-id-guard');
    const projectRoleGuard = screen.getByTestId('project-role-guard');
    const content = screen.getByTestId('content');

    expect(authGuard).toContainElement(projectIdGuard);
    expect(projectIdGuard).toContainElement(projectRoleGuard);
    expect(projectRoleGuard).toContainElement(content);
  });
});
