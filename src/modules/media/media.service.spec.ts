import { MediaService } from './media.service';

describe('MediaService', () => {
  it('health', () => {
    const service = new MediaService();
    expect(service.health().status).toBe('ok');
  });
});
