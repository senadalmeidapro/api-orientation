import { describe, expect, it, jest } from '@jest/globals';
import { BadgesService } from './badges.service';

const prisma = {
    badge: {
        upsert: jest.fn(),
        findMany: jest.fn<() => Promise<unknown[]>>().mockResolvedValue([]),
    },
} as any;

describe('BadgesService', () => {
    it('lists badges and ensures defaults', async () => {
        const service = new BadgesService(prisma);
        await service.listBadges();

        expect(prisma.badge.upsert).toHaveBeenCalled();
        expect(prisma.badge.findMany).toHaveBeenCalled();
        expect(prisma.badge.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                create: expect.objectContaining({
                    pointsValue: expect.any(Number),
                    unlockCondition: expect.any(Object),
                }),
            }),
        );
    });
});
