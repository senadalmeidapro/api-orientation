import { ArrayMinSize, IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Phase1ResponseItemDto } from './phase1-response-item.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePhase1ResponsesDto {
  @ApiProperty({ description: 'Session token', type: String, example: 'tok_sample_123456' })
  @IsString()
  sessionToken!: string;

  @ApiPropertyOptional({ description: 'Assessment id', type: String, example: 'clx123abc0001' })
  @IsOptional()
  @IsString()
  assessmentId?: string;

  @ApiProperty({ description: 'Responses', type: [Object], example: [{}] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => Phase1ResponseItemDto)
  responses!: Phase1ResponseItemDto[];
}
