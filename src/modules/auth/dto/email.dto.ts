import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { trimLowercase } from './transforms';

export class EmailDto {
    @Transform(({ value }) => trimLowercase(value))
    @IsEmail()
    @MaxLength(254)
    @IsNotEmpty()
    email!: string;
}
