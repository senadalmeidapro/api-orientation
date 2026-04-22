import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../../common/config/config.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
    private readonly logger = new Logger(PasswordService.name);

    private readonly saltRounds: number;

    constructor(private readonly config: ConfigService) {
        this.saltRounds = config.jwt.saltRounds;
    }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    async comparePassword(data: string | Buffer, encrypted: string): Promise<boolean> {
        return bcrypt.compare(data, encrypted);
    }
}
