import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { RiasecType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePhase1QuestionDto {
    @ApiProperty({
        description: 'Riasec type id',
        enum: RiasecType,
        example: Object.values(RiasecType)[0],
    })
    @IsEnum(RiasecType)
    riasecTypeId!: RiasecType;

    @ApiProperty({ description: 'Question text', type: String, example: 'value' })
    @IsString()
    questionText!: string;

    @ApiPropertyOptional({ description: 'Question short', type: String, example: 'value' })
    @IsOptional()
    @IsString()
    questionShort?: string;

    @ApiPropertyOptional({
        description: 'Illustration url',
        type: String,
        example: 'https://example.com',
    })
    @IsOptional()
    @IsString()
    illustrationUrl?: string;

    @ApiProperty({ description: 'Display order', type: Number, example: 1 })
    @Type(() => Number)
    @IsInt()
    displayOrder!: number;

    @ApiProperty({ description: 'Test version id', type: Number, example: 1 })
    @Type(() => Number)
    @IsInt()
    testVersionId!: number;

    @ApiPropertyOptional({ description: 'Is active', type: Boolean, example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
