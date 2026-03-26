import { MediaController } from './media.controller';
import { MediaService } from './media.service';

describe('MediaController', () => {
    it('health', () => {
        const service = {
            health: jest.fn().mockReturnValue({ status: 'ok' }),
        } as unknown as MediaService;
        const controller = new MediaController(service);

        const res = controller.health();
        expect(res.status).toBe('ok');
    });
});
