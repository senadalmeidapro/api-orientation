import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { AuditService } from '../../common/audit/audit.service';

describe('ResourcesController', () => {
    it('creates resource and logs audit', async () => {
        const service = {
            createResource: jest.fn().mockResolvedValue({ id: 1, title: 'R' }),
        } as unknown as ResourcesService;
        const audit = { logAction: jest.fn().mockResolvedValue({}) } as unknown as AuditService;
        const controller = new ResourcesController(service, audit);

        const res = await controller.create({ title: 'R' } as any, { id: 'admin1' }, {
            ip: '1.1.1.1',
            headers: { 'user-agent': 'jest' },
        } as any);

        expect(service.createResource).toHaveBeenCalled();
        expect(audit.logAction).toHaveBeenCalled();
        expect(res.id).toBe(1);
    });
});
