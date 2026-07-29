import type { PrismaService } from './prisma/prisma.service';
import { HealthController } from './health.controller';
import type { ConfigService } from '@common/config/config.service';

const config = {
  app: {
    name: 'Test API',
    version: '1.0.0',
    env: 'test',
  },
} as unknown as ConfigService;

const cache = {
  set: jest.fn(),
  get: jest.fn(async () => 'ok'),
} as any;

const response = {
  status: jest.fn(),
} as any;

describe('HealthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns API and database status when DB is reachable', async () => {
    const prisma = {
      $queryRawUnsafe: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    } as unknown as PrismaService;

    const controller = new HealthController(prisma, config, cache);
    const payload = await controller.health(response);

    expect(payload.status).toBe('ok');
    expect(payload.checks.database.status).toBe('ok');
    expect(payload.checks.database.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('throws ServiceUnavailableException with DB error details when DB is unreachable', async () => {
    const prisma = {
      $queryRawUnsafe: jest.fn().mockRejectedValue(new Error('connect ECONNREFUSED')),
    } as unknown as PrismaService;

    const controller = new HealthController(prisma, config, cache);

    await controller.health(response);

    expect(response.status).toHaveBeenCalledWith(503);
  });
});
