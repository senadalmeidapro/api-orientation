import { CareersController } from './careers.controller';
import { CareersService } from './careers.service';
import { AuditService } from '../../common/audit/audit.service';

describe('CareersController', () => {
    it('creates career and logs audit', async () => {
        const service = {
            create: jest.fn().mockResolvedValue({ id: 1, name: 'Dev' }),
        } as unknown as CareersService;
        const audit = { logAction: jest.fn().mockResolvedValue({}) } as unknown as AuditService;
        const controller = new CareersController(service, audit);

        const res = await controller.create({ name: 'Dev' } as any, { id: 'admin1' }, {
            ip: '1.1.1.1',
            headers: { 'user-agent': 'jest' },
        } as any);

        expect(service.create).toHaveBeenCalled();
        expect(audit.logAction).toHaveBeenCalled();
        expect(res.id).toBe(1);
    });
});
