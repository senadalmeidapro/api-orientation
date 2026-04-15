import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTrainingPathDto {
    @ApiProperty({ description: 'Name', type: String, example: 'John Doe' })
    @IsString()
    name!: string;

    @ApiPropertyOptional({
        description: 'Description',
        type: String,
        example: 'Description exemple',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'Level', type: String, example: 'value' })
    @IsOptional()
    @IsString()
    level?: string;

    @ApiPropertyOptional({ description: 'Duration months', type: Number, example: 75 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    durationMonths?: number;

    @ApiPropertyOptional({ description: 'Cost min', type: Number, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    costMin?: number;

    @ApiPropertyOptional({ description: 'Cost max', type: Number, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    costMax?: number;

    @ApiPropertyOptional({ description: 'Career id', type: Number, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    careerId?: number;

    @ApiPropertyOptional({ description: 'Institution id', type: Number, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    institutionId?: number;

    @ApiPropertyOptional({ description: 'Is active', type: Boolean, example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
