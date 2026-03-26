import { RolesGuard } from './roles.guard';

const makeContext = (user: any) =>
    ({
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
            getRequest: () => ({ user }),
        }),
    }) as any;

describe('RolesGuard', () => {
    it('allows admin when isAdmin is true', () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue(['admin']),
        } as any;
        const guard = new RolesGuard(reflector);
        const ctx = makeContext({ isAdmin: true, roles: [] });
        expect(guard.canActivate(ctx)).toBe(true);
    });

    it('allows editor when role exists', () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue(['editor']),
        } as any;
        const guard = new RolesGuard(reflector);
        const ctx = makeContext({ isAdmin: false, roles: ['EDITOR'] });
        expect(guard.canActivate(ctx)).toBe(true);
    });

    it('denies when no user', () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue(['editor']),
        } as any;
        const guard = new RolesGuard(reflector);
        const ctx = makeContext(undefined);
        expect(guard.canActivate(ctx)).toBe(false);
    });

    it('denies when role missing', () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue(['analyst']),
        } as any;
        const guard = new RolesGuard(reflector);
        const ctx = makeContext({ isAdmin: false, roles: ['EDITOR'] });
        expect(guard.canActivate(ctx)).toBe(false);
    });
});
