import { SessionsService } from './sessions.service';

const prisma = {
    testVersion: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
    },
    user: { findUnique: jest.fn() },
    session: { create: jest.fn(), findUnique: jest.fn() },
    assessment: { create: jest.fn() },
} as any;

describe('SessionsService', () => {
    it('creates session with initial assessment', async () => {
        prisma.testVersion.findUnique.mockResolvedValue({ id: 1 });
        prisma.session.create.mockResolvedValue({
            id: 1,
            sessionToken: 'token',
            shareToken: 'share',
            startedAt: new Date(),
        });
        prisma.assessment.create.mockResolvedValue({
            id: 'a1',
            type: 'PHASE1',
        });

        const service = new SessionsService(prisma);
        const res = await service.createSession({ testVersionId: 1 } as any);

        expect(res.sessionToken).toBe('token');
        expect(res.assessment.id).toBe('a1');
    });
});
