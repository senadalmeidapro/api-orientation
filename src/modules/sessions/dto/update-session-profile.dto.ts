import { IsObject } from 'class-validator';

export class UpdateSessionProfileDto {
    @IsObject()
    profile!: Record<string, unknown>;
}
