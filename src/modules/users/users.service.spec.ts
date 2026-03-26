import { UsersService } from './users.service';

const prisma = {
    user: {
        update: jest.fn(),
    },
} as any;

describe('UsersService', () => {
    it('updates roles with uppercase values', async () => {
        prisma.user.update.mockResolvedValue({ id: 'u1', roles: ['ADMIN'] });
        const service = new UsersService(prisma);

        await service.updateRoles('u1', { roles: ['admin', 'editor'] } as any);
        const call = prisma.user.update.mock.calls[0][0];
        expect(call.data.roles).toEqual(['ADMIN', 'EDITOR']);
    });
});
