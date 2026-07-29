import type { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';

describe('ResponsesController', () => {
  it('delegates general', async () => {
    const service = {
      saveResponse: jest.fn().mockResolvedValue({ saved: 1 }),
    } as unknown as ResponsesService;
    const controller = new ResponsesController(service, {} as any);

    await controller.saveGeneral({} as any);
    expect(service.saveResponse).toHaveBeenCalled();
  });
});
