import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
    it('maps payload to user', async () => {
        const strategy = new JwtStrategy();
        const res = await strategy.validate({
            sub: 'u1',
            email: 'a@b.com',
            isAdmin: true,
            roles: ['ADMIN'],
        });
        expect(res.id).toBe('u1');
        expect(res.roles).toEqual(['ADMIN']);
    });
});
