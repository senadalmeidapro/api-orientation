import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { randomUUID, createHash } from 'crypto';

@Injectable()
export class SessionLifecycleService {
    private readonly logger = new Logger(SessionLifecycleService.name);

    constructor(private readonly prisma: PrismaService) {}

    async createSession(userId?: string) {
        if (userId) {
            const userExists = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { id: true },
            });
            if (!userExists) throw new NotFoundException('Utilisateur introuvable');
        }

        const sessionToken = randomUUID();
        const sessionHash = createHash('sha256').update(sessionToken).digest('hex');

        // Sessions are valid for a default time, let's say 7 days.
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        return this.prisma.session.create({
            data: {
                session_token: sessionToken,
                session_hash: sessionHash,
                share_token: randomUUID(),
                user_id: userId ?? undefined,
                is_active: true,
                is_current: true,
                expires_at: expiresAt,
            },
        });
    }

    async getByToken(sessionToken: string) {
        const session = await this.prisma.session.findUnique({
            where: { session_token: sessionToken },
            include: {
                user: true,
                assessments: {
                    orderBy: { started_at: 'desc' },
                    include: {
                        result: true,
                        treasure_map: true,
                    },
                },
            },
        });

        if (!session) throw new NotFoundException('Session introuvable');
        return session;
    }

    async updateProfile(sessionToken: string, profileDto: any) {
        const session = await this.prisma.session.findUnique({
            where: { session_token: sessionToken },
            include: { user: true },
        });

        if (!session) throw new NotFoundException('Session introuvable');

        // Note: 'profile' field is completely absent from AuthSession in schema.prisma.
        // It resides solely on the 'User' model. We update the User directly if userId exists.
        // If it's an anonymous session, we ignore the profile update completely to adhere to schema.

        if (session.user_id) {
            await this.prisma.user.update({
                where: { id: session.user_id },
                data: {
                    first_name: profileDto.firstName ?? undefined,
                    last_name: profileDto.lastName ?? undefined,
                    // If your User had a generic JSON profile field, you would map it here.
                    // Assuming you only have fields explicitly defined in schema: bio, first_name, last_name, display_name
                },
            });
        }

        return session; // return unchanged session to satisfy flow, or re-fetch it
    }
}
