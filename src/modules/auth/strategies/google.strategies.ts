import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '../../../common/config/config.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private config: ConfigService) {
        super({
            clientID: config.oauth.google.clientId,
            clientSecret: config.oauth.google.clientSecret,
            callbackURL: config.oauth.google.callbackUrl,
            scope: ['email', 'profile'],
        });
    }

    validate(accessToken: string, _refreshToken: string, profile: Profile) {
        return {
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            picture: profile.photos?.[0]?.value,
            accessToken,
        };
    }
}
