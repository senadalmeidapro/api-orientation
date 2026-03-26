import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { AuditService } from '../../common/audit/audit.service';

describe('AnnouncementsController', () => {
    it('creates announcement and logs audit', async () => {
        const service = {
            createAnnouncement: jest.fn().mockResolvedValue({ id: 1, title: 'A' }),
        } as unknown as AnnouncementsService;
        const audit = { logAction: jest.fn().mockResolvedValue({}) } as unknown as AuditService;
        const controller = new AnnouncementsController(service, audit);

        const res = await controller.create({ title: 'A', content: 'x' } as any, { id: 'admin1' }, {
            ip: '1.1.1.1',
            headers: { 'user-agent': 'jest' },
        } as any);

        expect(service.createAnnouncement).toHaveBeenCalled();
        expect(audit.logAction).toHaveBeenCalled();
        expect(res.id).toBe(1);
    });
});
