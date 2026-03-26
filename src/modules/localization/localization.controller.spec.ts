import { LocalizationController } from './localization.controller';
import { LocalizationService } from './localization.service';
import { AuditService } from '../../common/audit/audit.service';

describe('LocalizationController', () => {
    it('creates language and logs audit', async () => {
        const service = {
            createLanguage: jest.fn().mockResolvedValue({ id: 1, code: 'fr' }),
        } as unknown as LocalizationService;
        const audit = { logAction: jest.fn().mockResolvedValue({}) } as unknown as AuditService;
        const controller = new LocalizationController(service, audit);

        const res = await controller.createLanguage(
            { code: 'fr', name: 'Francais' } as any,
            { id: 'admin1' },
            { ip: '1.1.1.1', headers: { 'user-agent': 'jest' } } as any,
        );

        expect(service.createLanguage).toHaveBeenCalled();
        expect(audit.logAction).toHaveBeenCalled();
        expect(res.id).toBe(1);
    });
});
