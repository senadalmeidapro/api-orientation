import { AnnouncementsService } from './announcements.service';
import { BadRequestException } from '@nestjs/common';

const prisma = {
    announcement: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    language: { findUnique: jest.fn() },
    announcementTranslation: { upsert: jest.fn() },
} as any;

describe('AnnouncementsService', () => {
    it('rejects invalid date', async () => {
        const service = new AnnouncementsService(prisma);
        await expect(
            service.createAnnouncement({ startDate: 'bad' } as any),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});
