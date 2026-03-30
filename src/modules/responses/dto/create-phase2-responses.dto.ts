import { ArrayMinSize, IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Phase2ResponseItemDto } from './phase2-response-item.dto';

export class CreatePhase2ResponsesDto {
    @IsString()
    sessionToken!: string;

    @IsOptional()
    @IsString()
    assessmentId?: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => Phase2ResponseItemDto)
    responses!: Phase2ResponseItemDto[];
}
