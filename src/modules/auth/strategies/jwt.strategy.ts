import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../../../common/config/config.service';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly auth: AuthService,
        config: ConfigService,
    ) {
        const secret = config.jwt.accessSecret;
        if (!secret) {
            throw new Error('JWT access secret not configured');
        }
        const issuer = config.jwt.issuer;
        const audience = config.jwt.audience;
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
