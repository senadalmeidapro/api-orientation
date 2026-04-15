import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';

describe('QuestionsController', () => {
    it('returns phase1 questions', async () => {
        const service = {
            getPhase1Questions: jest.fn().mockResolvedValue([{ id: 1 }]),
        } as unknown as QuestionsService;
        const controller = new QuestionsController(service);

        const res = await controller.getPhase1({ sessionToken: 'tok' } as any);

        expect(service.getPhase1Questions).toHaveBeenCalled();
        expect(res[0].id).toBe(1);
    });
});
