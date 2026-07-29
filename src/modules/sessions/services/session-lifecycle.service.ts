import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { randomUUID, createHash, type UUID } from 'crypto';

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

    const sessionCreateData: {
      sessionToken: string;
      sessionHash: string;
      shareToken: string;
      isActive: boolean;
      isCurrent: boolean;
      expiresAt: Date;
      userId?: UUID;
    } = {
      sessionToken,
      sessionHash,
      shareToken: randomUUID(),
      isActive: true,
      isCurrent: true,
      expiresAt,
      ...(userId ? { userId: userId as UUID } : {}),
    };

    return this.prisma.$transaction(async (tx) => {
      if (userId) {
        await tx.session.updateMany({
          where: {
            userId,
            isCurrent: true,
          },
          data: { isCurrent: false },
        });
      }

      return tx.session.create({
        data: sessionCreateData,
      });
    });
  }

  async getByToken(sessionToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: true,
        assessments: {
          orderBy: { startedAt: 'desc' },
          include: {
            result: true,
            treasureMap: true,
          },
        },
      },
    });

    if (!session) throw new NotFoundException('Session introuvable');
    return session;
  }

  async updateProfile(
    sessionToken: string,
    profileDto: {
      firstName?: unknown;
      lastName?: unknown;
    },
  ) {
    const session = await this.prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session) throw new NotFoundException('Session introuvable');

    // Note: 'profile' field is completely absent from AuthSession in schema.prisma.
    // It resides solely on the 'User' model. We update the User directly if userId exists.
    // If it's an anonymous session, we ignore the profile update completely to adhere to schema.

    if (session.userId) {
      const firstName = typeof profileDto.firstName === 'string' ? profileDto.firstName : undefined;
      const lastName = typeof profileDto.lastName === 'string' ? profileDto.lastName : undefined;
      const userUpdateData: { firstName?: string; lastName?: string } = {};

      if (firstName !== undefined) userUpdateData.firstName = firstName;
      if (lastName !== undefined) userUpdateData.lastName = lastName;

      if (Object.keys(userUpdateData).length > 0) {
        await this.prisma.user.update({
          where: { id: session.userId },
          data: userUpdateData,
        });
      }
    }

    return session; // return unchanged session to satisfy flow, or re-fetch it
  }
}
