import { BadgesService } from './badges.service';

const prisma = {
    badge: {
        upsert: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
    },
} as any;

describe('BadgesService', () => {
    it('lists badges and ensures defaults', async () => {
        const service = new BadgesService(prisma);
        await service.listBadges();

        expect(prisma.badge.upsert).toHaveBeenCalled();
        expect(prisma.badge.findMany).toHaveBeenCalled();
    });
});
