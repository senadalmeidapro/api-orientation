import { IsString } from 'class-validator';

export class SessionTokenParam {
    @IsString()
    sessionToken!: string;
}
