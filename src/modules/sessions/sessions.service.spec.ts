import { SessionsService } from './sessions.service';

const prisma = {
    testVersion: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
    },
    user: { findUnique: jest.fn() },
    userTestSession: { create: jest.fn(), findUnique: jest.fn() },
} as any;

describe('SessionsService', () => {
    it('creates session with active version', async () => {
        prisma.testVersion.findUnique.mockResolvedValue({ id: 1 });
        prisma.userTestSession.create.mockResolvedValue({
            id: 's1',
            sessionToken: 'token',
            shareToken: 'share',
            testVersionId: 1,
            currentPhase: 'PHASE_1',
            startedAt: new Date(),
        });
        const service = new SessionsService(prisma);
        const res = await service.createSession({ testVersionId: 1 } as any);

        expect(res.sessionToken).toBe('token');
        expect(res.currentPhase).toBe('PHASE_1');
    });
});
