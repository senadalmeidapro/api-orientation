import { InstitutionsController } from './institutions.controller';
import { InstitutionsService } from './institutions.service';
import { AuditService } from '../../common/audit/audit.service';

describe('InstitutionsController', () => {
    it('creates institution and logs audit', async () => {
        const service = {
            createInstitution: jest.fn().mockResolvedValue({ id: 1, name: 'E1' }),
        } as unknown as InstitutionsService;
        const audit = { logAction: jest.fn().mockResolvedValue({}) } as unknown as AuditService;
        const controller = new InstitutionsController(service, audit);

        const res = await controller.create({ name: 'E1' } as any, { id: 'admin1' }, {
            ip: '1.1.1.1',
            headers: { 'user-agent': 'jest' },
        } as any);

        expect(service.createInstitution).toHaveBeenCalled();
        expect(audit.logAction).toHaveBeenCalled();
        expect(res.id).toBe(1);
    });
});
