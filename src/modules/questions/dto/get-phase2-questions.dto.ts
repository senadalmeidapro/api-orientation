import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Phase2Type } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetPhase2QuestionsDto {
    @ApiProperty({ description: 'Session token', type: String, example: 'tok_sample_123456' })
    @IsString()
    sessionToken!: string;

    @ApiPropertyOptional({ description: 'Assessment id', type: String, example: 'clx123abc0001' })
    @IsOptional()
    @IsString()
    assessmentId?: string;

    @ApiPropertyOptional({
        description: 'Section',
        enum: Phase2Type,
        example: Object.values(Phase2Type)[0],
    })
    @IsOptional()
    @IsEnum(Phase2Type)
    section?: Phase2Type;

    @ApiPropertyOptional({ description: 'Take', type: Number, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(60)
    take?: number;

    @ApiPropertyOptional({ description: 'Lang', type: String, example: 'value' })
    @IsOptional()
    @IsString()
    lang?: string;
}
