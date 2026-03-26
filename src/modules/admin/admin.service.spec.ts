import { AdminService } from './admin.service';

const prisma = {
    riasecTypeModel: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    aptitudeResponseOption: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    adminAuditLog: {
        findMany: jest.fn(),
    },
} as any;

describe('AdminService', () => {
    it('caps audit log limit', async () => {
        prisma.adminAuditLog.findMany.mockResolvedValue([]);
        const service = new AdminService(prisma);

        await service.listAuditLogs({ limit: 1000 } as any);

        const call = prisma.adminAuditLog.findMany.mock.calls[0][0];
        expect(call.take).toBe(500);
    });

    it('returns roles catalog', () => {
        const service = new AdminService(prisma);
        const res = service.getRolesCatalog();
        expect(res.roles).toContain('ADMIN');
        expect(res.legacyIsAdmin).toBe(true);
    });
});
