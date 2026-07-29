import type { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';

describe('QuestionsController', () => {
  it('returns general questions', async () => {
    const service = {
      getQuestions: jest.fn().mockResolvedValue([{ id: 1 }]),
    } as unknown as QuestionsService;
    const controller = new QuestionsController(service);

    const res = await controller.getGeneral({ sessionToken: 'tok' });

    expect(service.getQuestions).toHaveBeenCalled();
    expect(res[0]?.id).toBe(1);
  });
});
