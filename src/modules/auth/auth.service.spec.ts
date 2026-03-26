import { AuthService } from './auth.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
    it('registers and returns tokens', async () => {
        mockedBcrypt.hash.mockResolvedValue('hashed');
        const prisma = {
            user: {
                findUnique: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockResolvedValue({
                    id: 'u1',
                    email: 'a@b.com',
                    firstName: 'A',
                    lastName: 'B',
                    isAdmin: false,
                    roles: [],
                }),
            },
            refreshToken: {
                create: jest.fn().mockResolvedValue({}),
            },
        } as any;
        const jwt = { sign: jest.fn().mockReturnValue('jwt') } as any;
        const mail = { sendPasswordReset: jest.fn() } as any;

        const service = new AuthService(prisma, jwt, mail);
        const res = await service.register(
            { email: 'a@b.com', password: 'x' } as any,
            '1.1.1.1',
            'ua',
        );

        expect(jwt.sign).toHaveBeenCalled();
        expect(prisma.refreshToken.create).toHaveBeenCalled();
        expect(res.access_token).toBe('jwt');
        expect(res.refresh_token).toBeDefined();
    });

    it('returns token on password reset when mail fails in dev', async () => {
        mockedBcrypt.hash.mockResolvedValue('hashed');
        const prisma = {
            user: { findUnique: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com' }) },
            passwordResetToken: { create: jest.fn().mockResolvedValue({}) },
        } as any;
        const jwt = { sign: jest.fn() } as any;
        const mail = { sendPasswordReset: jest.fn().mockResolvedValue(false) } as any;

        const service = new AuthService(prisma, jwt, mail);
        const res = await service.requestPasswordReset('a@b.com');

        expect(res.success).toBe(true);
        expect(res.token).toBeDefined();
    });
});
