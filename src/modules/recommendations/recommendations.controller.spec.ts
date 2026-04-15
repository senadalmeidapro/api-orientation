import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';

describe('RecommendationsController', () => {
    it('delegates to service', async () => {
        const service = {
            getRecommendations: jest.fn().mockResolvedValue([]),
        } as unknown as RecommendationsService;
        const controller = new RecommendationsController(service);

        await controller.getRecommendations({ sessionToken: 's' } as any);
        expect(service.getRecommendations).toHaveBeenCalled();
    });
});
