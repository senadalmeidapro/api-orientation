import { ContactService } from './contact.service';
import { BadRequestException } from '@nestjs/common';

const prisma = {
    contactRequest: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
    },
} as any;

describe('ContactService', () => {
    it('throws on invalid preferred date', async () => {
        const service = new ContactService(prisma);
        await expect(service.create({ preferredDate: 'invalid' } as any)).rejects.toBeInstanceOf(
            BadRequestException,
        );
    });

    it('updates request', async () => {
        prisma.contactRequest.update.mockResolvedValue({ id: 1 });
        const service = new ContactService(prisma);
        const res = await service.update(1, { status: 'CLOSED' } as any);
        expect(res.id).toBe(1);
    });
});
