import type { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { UnauthorizedException } from '@nestjs/common';

describe('RecommendationsController', () => {
  it('delegates to service', async () => {
    const service = {
      getRecommendations: jest.fn(async () => []),
      getFormationRecommendations: jest.fn(async () => []),
    } as unknown as RecommendationsService;
    const controller = new RecommendationsController(service);

    await controller.getRecommendations('s', { limit: 2 });
    expect(service.getRecommendations).toHaveBeenCalledWith({ limit: 2, sessionToken: 's' });

    await controller.getFormationRecommendations('s', { limit: 2 });
    expect(service.getFormationRecommendations).toHaveBeenCalledWith({
      limit: 2,
      sessionToken: 's',
    });
  });

  it('rejects requests without x-session-token header', async () => {
    const service = {
      getRecommendations: jest.fn(async () => []),
      getFormationRecommendations: jest.fn(async () => []),
    } as unknown as RecommendationsService;
    const controller = new RecommendationsController(service);

    await expect(controller.getRecommendations(undefined, { limit: 1 })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(
      controller.getFormationRecommendations(undefined, { limit: 1 }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
