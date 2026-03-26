import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { AuditService } from '../../common/audit/audit.service';

describe('QuestionsController', () => {
    it('creates phase1 question and logs audit', async () => {
        const service = {
            createPhase1Question: jest.fn().mockResolvedValue({ id: 1, riasecTypeId: 'R' }),
        } as unknown as QuestionsService;
        const audit = { logAction: jest.fn().mockResolvedValue({}) } as unknown as AuditService;
        const controller = new QuestionsController(service, audit);

        const res = await controller.createPhase1(
            { riasecTypeId: 'R', questionText: 'q' } as any,
            { id: 'admin1' },
            { ip: '1.1.1.1', headers: { 'user-agent': 'jest' } } as any,
        );

        expect(service.createPhase1Question).toHaveBeenCalled();
        expect(audit.logAction).toHaveBeenCalled();
        expect(res.id).toBe(1);
    });
});
