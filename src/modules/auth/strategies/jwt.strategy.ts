import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly auth: AuthService,
        config: ConfigService,
    ) {
        const secret = config.get<string>('JWT_ACCESS_SECRET') ?? config.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT access secret not configured');
        }
        const issuer = config.get<string>('JWT_ISSUER') ?? 'api-orientation-issue';
        const audience = config.get<string>('JWT_AUDIENCE') ?? 'api-orientation-audience';
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
            issuer,
            audience,
        });
    }

    async validate(payload: JwtPayload) {
        return await this.auth.validateUserFromJwt(payload);
    }
}
