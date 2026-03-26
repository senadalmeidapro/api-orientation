import { ResourcesService } from './resources.service';
import { NotFoundException } from '@nestjs/common';

const prisma = {
    resource: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
    },
    language: { findUnique: jest.fn() },
    resourceTranslation: { upsert: jest.fn() },
} as any;

describe('ResourcesService', () => {
    it('throws when resource not found', async () => {
        prisma.resource.findUnique.mockResolvedValue(null);
        const service = new ResourcesService(prisma);
        await expect(service.getResource(1)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('adds translation when language exists', async () => {
        prisma.language.findUnique.mockResolvedValue({ id: 1 });
        prisma.resourceTranslation.upsert.mockResolvedValue({ id: 1 });
        const service = new ResourcesService(prisma);
        const res = await service.addTranslation(1, { languageCode: 'fr', title: 'T' } as any);
        expect(res.id).toBe(1);
    });
});
