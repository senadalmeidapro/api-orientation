import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';

describe('BadgesController', () => {
    it('lists badges', async () => {
        const service = { listBadges: jest.fn().mockResolvedValue([]) } as unknown as BadgesService;
        const controller = new BadgesController(service);

        await controller.list();
        expect(service.listBadges).toHaveBeenCalled();
    });
});
