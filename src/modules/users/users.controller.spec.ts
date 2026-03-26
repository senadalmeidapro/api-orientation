import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuditService } from '../../common/audit/audit.service';

describe('UsersController', () => {
    it('updates roles and logs audit', async () => {
        const service = {
            updateRoles: jest.fn().mockResolvedValue({ id: 'u1', roles: ['ADMIN'], isAdmin: true }),
        } as unknown as UsersService;
        const audit = {
            logAction: jest.fn().mockResolvedValue({}),
        } as unknown as AuditService;

        const controller = new UsersController(service, audit);
        const res = await controller.updateRoles(
            'u1',
            { roles: ['admin'], isAdmin: true } as any,
            { id: 'admin1' },
            { ip: '1.1.1.1', headers: { 'user-agent': 'jest' } } as any,
        );

        expect(service.updateRoles).toHaveBeenCalled();
        expect(audit.logAction).toHaveBeenCalled();
        expect(res.id).toBe('u1');
    });
});
