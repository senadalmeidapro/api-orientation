import { ScoringController } from './scoring.controller';

describe('ScoringController', () => {
  it('health', () => {
    const controller = new ScoringController();
    const res = controller.health();
    expect(res.module).toBe('scoring');
  });
});
