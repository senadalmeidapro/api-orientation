import type { ScoringService } from './scoring.service';
import { ScoringController } from './scoring.controller';

describe('ScoringController', () => {
    it('health', () => {
        const service = {} as unknown as ScoringService;
        const controller = new ScoringController(service);
        const res = controller.health();
        expect(res.module).toBe('scoring');
    });
});
