import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@owox/ui/components/button';
import { Input } from '@owox/ui/components/input';
import { useProjects } from '../../features/idp/hooks/useProjects';
import { buildProjectPath } from '../../utils/path';
import { useFlags } from '../../app/store/hooks';
import { checkVisible } from '../../utils/check-visible';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { flags } = useFlags();
  const {
    projects,
    isLoading,
    error,
    reload,
    createProject,
    renameProject,
    archiveProject,
    unarchiveProject,
    selectProject,
  } = useProjects();
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const canManageProjects = checkVisible('IDP_PROVIDER', 'better-auth', flags);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function handleCreate() {
    try {
      const project = await createProject(name);
      setName('');
      setMessage(null);
      await selectProject(project.id);
      void navigate(buildProjectPath(project.id, '/data-marts'));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unable to create project');
    }
  }

  async function handleRename(projectId: string) {
    const title = window.prompt(
      'Project name',
      projects.find(p => p.id === projectId)?.title ?? ''
    );
    if (title == null) return;
    try {
      await renameProject(projectId, title);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unable to rename project');
    }
  }

  async function handleSelect(projectId: string) {
    try {
      if (canManageProjects) await selectProject(projectId);
      window.location.assign(buildProjectPath(projectId, '/data-marts'));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unable to select project');
    }
  }

  return (
    <main className='mx-auto max-w-3xl p-8'>
      <h1 className='mb-2 text-2xl font-semibold'>Projects</h1>
      <p className='text-muted-foreground mb-6 text-sm'>
        Manage up to 20 Projects. Archived Projects remain readable but are read-only.
      </p>
      {canManageProjects ? (
        <div className='mb-8 flex gap-2'>
          <Input
            value={name}
            onChange={e => {
              setName(e.target.value);
            }}
            placeholder='New project name'
            maxLength={100}
          />
          <Button onClick={() => void handleCreate()} disabled={!name.trim() || isLoading}>
            Create
          </Button>
        </div>
      ) : (
        <p className='text-muted-foreground mb-8 text-sm'>
          Project creation and lifecycle management are not available with the configured identity
          provider.
        </p>
      )}
      {message && <p className='text-destructive mb-4 text-sm'>{message}</p>}
      {error && <p className='text-destructive mb-4 text-sm'>{error.message}</p>}
      <div className='space-y-3'>
        {projects.map(project => (
          <section
            key={project.id}
            className='flex items-center justify-between rounded-lg border p-4'
          >
            <div>
              <div className='font-medium'>{project.title}</div>
              <div className='text-muted-foreground text-xs'>
                {project.archived
                  ? 'Archived · read-only'
                  : project.id === '0'
                    ? 'Default Project'
                    : 'Active'}
              </div>
            </div>
            <div className='flex gap-2'>
              {canManageProjects &&
                (project.archived ? (
                  <Button variant='outline' onClick={() => void unarchiveProject(project.id)}>
                    Unarchive
                  </Button>
                ) : (
                  <Button variant='outline' onClick={() => void archiveProject(project.id)}>
                    Archive
                  </Button>
                ))}
              {canManageProjects && (
                <Button
                  variant='outline'
                  onClick={() => {
                    void handleRename(project.id);
                  }}
                >
                  Rename
                </Button>
              )}
              <Button onClick={() => void handleSelect(project.id)}>Open</Button>
            </div>
          </section>
        ))}
      </div>
      {!projects.length && !isLoading && (
        <p className='text-muted-foreground text-sm'>No Project memberships yet.</p>
      )}
    </main>
  );
}
