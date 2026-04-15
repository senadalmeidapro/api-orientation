import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSessionProfileDto {
    @ApiProperty({ description: 'Profile', type: Object, example: { key: 'value' } })
    @IsObject()
    profile!: Record<string, unknown>;
}
