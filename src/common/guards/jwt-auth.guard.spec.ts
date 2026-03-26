import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
    it('allows public routes', () => {
        const reflector = { getAllAndOverride: jest.fn().mockReturnValue(true) } as any;
        const guard = new JwtAuthGuard(reflector);

        const ctx: any = { getHandler: () => ({}), getClass: () => ({}) };
        expect(guard.canActivate(ctx)).toBe(true);
    });
});
