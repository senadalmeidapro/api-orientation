import { ResponsesController } from './responses.controller';
import { ResponsesService } from './responses.service';

describe('ResponsesController', () => {
    it('delegates phase1', async () => {
        const service = {
            savePhase1: jest.fn().mockResolvedValue({ saved: 1 }),
        } as unknown as ResponsesService;
        const controller = new ResponsesController(service);

        await controller.savePhase1({} as any);
        expect(service.savePhase1).toHaveBeenCalled();
    });
});
