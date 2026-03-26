import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
    it('register passes ip and user-agent', async () => {
        const service = {
            register: jest.fn().mockResolvedValue({ access_token: 'x' }),
        } as unknown as AuthService;
        const controller = new AuthController(service);

        await controller.register(
            { email: 'a@b.com', password: 'x' } as any,
            {
                ip: '1.2.3.4',
                headers: { 'user-agent': 'jest' },
            } as any,
        );

        expect(service.register).toHaveBeenCalledWith(
            { email: 'a@b.com', password: 'x' },
            '1.2.3.4',
            'jest',
        );
    });
});
