import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsOptional } from 'class-validator';

import { SendEmailDto, SendEmailOptionsDto, SendTemplateEmailDto } from './send-email.dto';

export class SendEmailRequestDto {
    @ApiProperty({
        description: 'Payload email standard (destinataire, sujet, contenu).',
        type: SendEmailDto,
    })
    @ValidateNested()
    @Type(() => SendEmailDto)
    payload!: SendEmailDto;

    @ApiPropertyOptional({
        description: 'Options d’envoi (from, cc, bcc, timeout, retry, etc.).',
        type: SendEmailOptionsDto,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => SendEmailOptionsDto)
    options?: SendEmailOptionsDto;
}

export class SendTemplateEmailRequestDto {
    @ApiProperty({
        description: 'Payload email template (destinataire, templateId, params).',
        type: SendTemplateEmailDto,
    })
    @ValidateNested()
    @Type(() => SendTemplateEmailDto)
    payload!: SendTemplateEmailDto;

    @ApiPropertyOptional({
        description: 'Options d’envoi (from, cc, bcc, timeout, retry, etc.).',
        type: SendEmailOptionsDto,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => SendEmailOptionsDto)
    options?: SendEmailOptionsDto;
}
