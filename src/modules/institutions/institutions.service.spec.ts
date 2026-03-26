import { InstitutionsService } from './institutions.service';
import { NotFoundException } from '@nestjs/common';

const prisma = {
    trainingInstitution: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    language: { findUnique: jest.fn() },
    trainingInstitutionTranslation: { upsert: jest.fn() },
} as any;

describe('InstitutionsService', () => {
    it('throws when institution not found', async () => {
        prisma.trainingInstitution.findUnique.mockResolvedValue(null);
        const service = new InstitutionsService(prisma);
        await expect(service.getInstitution(1)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('adds translation when language exists', async () => {
        prisma.language.findUnique.mockResolvedValue({ id: 1 });
        prisma.trainingInstitutionTranslation.upsert.mockResolvedValue({ id: 1 });
        const service = new InstitutionsService(prisma);
        const res = await service.addTranslation(1, { languageCode: 'fr', name: 'E1' } as any);
        expect(res.id).toBe(1);
    });
});
