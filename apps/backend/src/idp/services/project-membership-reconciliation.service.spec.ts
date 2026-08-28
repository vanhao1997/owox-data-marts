import { ProjectMembershipReconciliationService } from './project-membership-reconciliation.service';

describe('ProjectMembershipReconciliationService', () => {
  it('does not apply pending scope before invitation acceptance', async () => {
    const pendingRepository = {
      find: jest.fn().mockResolvedValue([
        {
          invitationId: 'inv-1',
          projectId: 'project-1',
          email: 'invitee@example.com',
          role: 'viewer',
          roleScope: 'entire_project',
          contextIdsJson: '[]',
        },
      ]),
      delete: jest.fn(),
      save: jest.fn(),
    };
    const roleScopeRepository = { upsert: jest.fn() };
    const roleContextRepository = { delete: jest.fn(), save: jest.fn() };
    const provider = {
      isInvitationAccepted: jest.fn().mockResolvedValue(false),
      getProjectMembers: jest.fn(),
    };
    const service = new ProjectMembershipReconciliationService(
      pendingRepository as never,
      roleScopeRepository as never,
      roleContextRepository as never,
      { getProviderFromApp: () => provider } as never
    );

    await service.reconcile('user-1', 'invitee@example.com');

    expect(provider.getProjectMembers).not.toHaveBeenCalled();
    expect(roleScopeRepository.upsert).not.toHaveBeenCalled();
    expect(roleContextRepository.save).not.toHaveBeenCalled();
    expect(pendingRepository.delete).not.toHaveBeenCalled();
  });

  it('applies scope after invitation acceptance and membership exists', async () => {
    const pendingRepository = {
      find: jest.fn().mockResolvedValue([
        {
          invitationId: 'inv-1',
          projectId: 'project-1',
          email: 'invitee@example.com',
          role: 'viewer',
          roleScope: 'selected_contexts',
          contextIdsJson: '["ctx-1"]',
        },
      ]),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const roleScopeRepository = { upsert: jest.fn().mockResolvedValue(undefined) };
    const roleContextRepository = {
      delete: jest.fn().mockResolvedValue(undefined),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const provider = {
      isInvitationAccepted: jest.fn().mockResolvedValue(true),
      getProjectMembers: jest.fn().mockResolvedValue([{ userId: 'user-1' }]),
    };
    const service = new ProjectMembershipReconciliationService(
      pendingRepository as never,
      roleScopeRepository as never,
      roleContextRepository as never,
      { getProviderFromApp: () => provider } as never
    );

    await service.reconcile('user-1', 'invitee@example.com');

    expect(roleContextRepository.delete).toHaveBeenCalledWith({
      userId: 'user-1',
      projectId: 'project-1',
    });
    expect(roleContextRepository.save).toHaveBeenCalledWith([
      { userId: 'user-1', projectId: 'project-1', contextId: 'ctx-1' },
    ]);
    expect(roleScopeRepository.upsert).toHaveBeenCalledWith(
      { userId: 'user-1', projectId: 'project-1', roleScope: 'selected_contexts' },
      ['userId', 'projectId']
    );
    expect(pendingRepository.delete).toHaveBeenCalledWith({ invitationId: 'inv-1' });
  });
});
