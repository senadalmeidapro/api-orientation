import { SessionLifecycleService } from './session-lifecycle.service';

const prisma = {
  user: {
    findUnique: jest.fn(),
  },
  session: {
    create: jest.fn(),
    updateMany: jest.fn(),
  },
  $transaction: jest.fn(),
} as any;

describe('SessionLifecycleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((callback: any) => callback(prisma));
  });

  it('makes the new authenticated session the only current session', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
    prisma.session.updateMany.mockResolvedValue({ count: 1 });
    prisma.session.create.mockResolvedValue({
      id: 'session-2',
      userId: 'user-1',
      isCurrent: true,
    });

    const service = new SessionLifecycleService(prisma);

    const session = await service.createSession('user-1');

    expect(prisma.session.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        isCurrent: true,
      },
      data: { isCurrent: false },
    });
    expect(prisma.session.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        isCurrent: true,
        isActive: true,
      }),
    });
    expect(session.id).toBe('session-2');
  });

  it('does not deactivate sessions for an anonymous session', async () => {
    prisma.session.create.mockResolvedValue({
      id: 'anonymous-session',
      userId: null,
      isCurrent: true,
    });

    const service = new SessionLifecycleService(prisma);

    await service.createSession();

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.session.updateMany).not.toHaveBeenCalled();
    expect(prisma.session.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        isCurrent: true,
        isActive: true,
      }),
    });
  });
});
