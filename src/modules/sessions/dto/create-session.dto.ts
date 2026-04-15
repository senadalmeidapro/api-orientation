import { IsEnum, IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AssessmentType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
    @ApiPropertyOptional({ description: 'Test version id', type: Number, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    testVersionId?: number;

    @ApiPropertyOptional({
        description: 'Initial assessment type',
        enum: AssessmentType,
        example: Object.values(AssessmentType)[0],
    })
    @IsOptional()
    @IsEnum(AssessmentType)
    initialAssessmentType?: AssessmentType;

    @ApiPropertyOptional({ description: 'Depth', type: Number, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(20)
    depth?: number;

    @ApiPropertyOptional({ description: 'Profile', type: Object, example: { key: 'value' } })
    @IsOptional()
    @IsObject()
    profile?: Record<string, unknown>;
}
