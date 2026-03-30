import { ArrayMinSize, IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Phase1ResponseItemDto } from './phase1-response-item.dto';

export class CreatePhase1ResponsesDto {
    @IsString()
    sessionToken!: string;

    @IsOptional()
    @IsString()
    assessmentId?: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => Phase1ResponseItemDto)
    responses!: Phase1ResponseItemDto[];
}
