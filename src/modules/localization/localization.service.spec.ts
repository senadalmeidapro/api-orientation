import { LocalizationService } from './localization.service';

const prisma = {
    language: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
} as any;

describe('LocalizationService', () => {
    it('lists languages', async () => {
        prisma.language.findMany.mockResolvedValue([{ id: 1 }]);
        const service = new LocalizationService(prisma);
        const res = await service.listLanguages(true);
        expect(res[0].id).toBe(1);
    });

    it('creates language', async () => {
        prisma.language.create.mockResolvedValue({ id: 1 });
        const service = new LocalizationService(prisma);
        const res = await service.createLanguage({ code: 'fr', name: 'Francais' } as any);
        expect(res.id).toBe(1);
    });
});
