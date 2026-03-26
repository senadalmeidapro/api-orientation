import { AuditService } from './audit.service';

const prisma = {
    adminAuditLog: { create: jest.fn() },
} as any;

describe('AuditService', () => {
    it('logs action with entityId string', async () => {
        prisma.adminAuditLog.create.mockResolvedValue({ id: 1 });
        const service = new AuditService(prisma);

        await service.logAction({ userId: 'u1', action: 'update', entity: 'X', entityId: 10 });
        const call = prisma.adminAuditLog.create.mock.calls[0][0];
        expect(call.data.entityId).toBe('10');
    });
});
