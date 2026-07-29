import type { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { UnauthorizedException } from '@nestjs/common';

describe('RecommendationsController', () => {
  it('delegates to service', async () => {
    const service = {
      getCareerRecommendations: jest.fn(async () => []),
      getFormationRecommendations: jest.fn(async () => []),
    } as unknown as RecommendationsService;
    const controller = new RecommendationsController(service);

    await controller.getCareerRecommendations('s', { limit: 2 });
    expect(service.getCareerRecommendations).toHaveBeenCalledWith({ limit: 2 }, 's');

    await controller.getFormationRecommendations('s', { limit: 2 });
    expect(service.getFormationRecommendations).toHaveBeenCalledWith({ limit: 2 }, 's');
  });

  it('rejects requests without x-session-token header', async () => {
    const service = {
      getCareerRecommendations: jest.fn(async () => []),
      getFormationRecommendations: jest.fn(async () => []),
    } as unknown as RecommendationsService;
    const controller = new RecommendationsController(service);

    expect(() => controller.getCareerRecommendations(undefined, { limit: 1 })).toThrow(
      UnauthorizedException,
    );
    expect(() => controller.getFormationRecommendations(undefined, { limit: 1 })).toThrow(
      UnauthorizedException,
    );
  });
});
