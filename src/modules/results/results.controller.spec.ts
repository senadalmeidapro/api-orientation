import { ResultsController } from './results.controller';
import type { ResultsService } from './results.service';

describe('ResultsController', () => {
    it('delegates compute', async () => {
        const service = {
            compute: jest.fn().mockResolvedValue({ id: 1 }),
        } as unknown as ResultsService;
        const controller = new ResultsController(service);

        await controller.compute({ sessionToken: 's' } as any);
        expect(service.compute).toHaveBeenCalled();
    });
});
