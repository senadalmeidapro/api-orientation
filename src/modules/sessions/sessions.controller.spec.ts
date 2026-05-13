import { SessionsController } from './sessions.controller';
import type { SessionsService } from './sessions.service';

describe('SessionsController', () => {
  it('delegates create', async () => {
    const service = {
      createSession: jest.fn().mockResolvedValue({ sessionId: 's1' }),
    } as unknown as SessionsService;
    const controller = new SessionsController(service);

    await controller.create({} as any);
    expect(service.createSession).toHaveBeenCalled();
  });
});
