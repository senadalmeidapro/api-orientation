import { ServiceUnavailableException } from '@nestjs/common';
import type { PrismaService } from './prisma/prisma.service';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns API and database status when DB is reachable', async () => {
    const prisma = {
      $queryRawUnsafe: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    } as unknown as PrismaService;

    const controller = new HealthController(prisma);
    const response = await controller.health();

    expect(response.status).toBe('ok');
    expect(response.database.status).toBe('ok');
    expect(response.database.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('throws ServiceUnavailableException with DB error details when DB is unreachable', async () => {
    const prisma = {
      $queryRawUnsafe: jest.fn().mockRejectedValue(new Error('connect ECONNREFUSED')),
    } as unknown as PrismaService;

    const controller = new HealthController(prisma);

    try {
      await controller.health();
      fail('Expected health() to throw ServiceUnavailableException');
    } catch (error) {
      expect(error).toBeInstanceOf(ServiceUnavailableException);
      const payload = (error as ServiceUnavailableException).getResponse() as {
        database: { status: string; message: string };
      };
      expect(payload.database.status).toBe('down');
      expect(payload.database.message).toContain('ECONNREFUSED');
    }
  });
});
