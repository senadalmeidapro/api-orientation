import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';

describe('ScoringController', () => {
    it('health', () => {
        const service = {} as unknown as ScoringService;
        const controller = new ScoringController(service);
        const res = controller.health();
        expect(res.module).toBe('scoring');
    });
});
