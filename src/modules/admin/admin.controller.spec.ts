import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuditService } from '../../common/audit/audit.service';

describe('AdminController', () => {
    it('creates riasec type and logs audit', async () => {
        const service = {
            createRiasecType: jest.fn().mockResolvedValue({ id: 'R', name: 'Realiste' }),
        } as unknown as AdminService;
        const audit = {
            logAction: jest.fn().mockResolvedValue({}),
        } as unknown as AuditService;

        const controller = new AdminController(service, audit);
        const res = await controller.createRiasec(
            { id: 'R', name: 'Realiste' } as any,
            { id: 'admin1' },
            { ip: '1.1.1.1', headers: { 'user-agent': 'jest' } } as any,
        );

        expect(service.createRiasecType).toHaveBeenCalled();
        expect(audit.logAction).toHaveBeenCalled();
        expect(res.id).toBe('R');
    });

    it('returns roles catalog', () => {
        const service = {
            getRolesCatalog: jest.fn().mockReturnValue({ roles: ['ADMIN'], legacyIsAdmin: true }),
        } as unknown as AdminService;
        const audit = { logAction: jest.fn() } as unknown as AuditService;

        const controller = new AdminController(service, audit);
        const res = controller.listRoles();

        expect(res.roles).toContain('ADMIN');
    });
});
