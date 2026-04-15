import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

const DEFAULT_SALT_ROUNDS = 10;

@Injectable()
export class PasswordService {
    private readonly saltRounds: number;

    constructor(private readonly config: ConfigService) {
        const rounds = Number(this.config.get('BCRYPT_SALT_ROUNDS') ?? DEFAULT_SALT_ROUNDS);
        this.saltRounds = Number.isFinite(rounds) && rounds >= 8 ? rounds : DEFAULT_SALT_ROUNDS;
    }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    async comparePassword(data: string | Buffer, encrypted: string): Promise<boolean> {
        return bcrypt.compare(data, encrypted);
    }
}
