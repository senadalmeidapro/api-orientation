import { CareersService } from './careers.service';
import { NotFoundException } from '@nestjs/common';

const prisma = {
    career: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
} as any;

describe('CareersService', () => {
    it('throws when career not found', async () => {
        prisma.career.findUnique.mockResolvedValue(null);
        const service = new CareersService(prisma);

        await expect(service.getById(1)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('creates career', async () => {
        prisma.career.create.mockResolvedValue({ id: 1 });
        const service = new CareersService(prisma);

        const res = await service.create({ name: 'Test' } as any);
        expect(res.id).toBe(1);
    });
});
