import { ThrottlerBehindProxyGuard } from './throttler-behind-proxy.guard';

describe('ThrottlerBehindProxyGuard', () => {
  it('uses x-forwarded-for when present', async () => {
    const guard = new ThrottlerBehindProxyGuard();
    const tracker = await (
      guard as unknown as {
        getTracker: (req: unknown) => Promise<string>;
      }
    ).getTracker({
      headers: { 'x-forwarded-for': '1.1.1.1, 2.2.2.2' },
      ip: '3.3.3.3',
    });
    expect(tracker).toBe('1.1.1.1');
  });
});
