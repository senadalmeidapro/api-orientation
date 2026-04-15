import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AssessmentType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssessmentDto {
    @ApiProperty({
        description: 'Type',
        enum: AssessmentType,
        example: Object.values(AssessmentType)[0],
    })
    @IsEnum(AssessmentType)
    type!: AssessmentType;

    @ApiPropertyOptional({ description: 'Test version id', type: Number, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    testVersionId?: number;

    @ApiPropertyOptional({ description: 'Depth', type: Number, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(20)
    depth?: number;
}
