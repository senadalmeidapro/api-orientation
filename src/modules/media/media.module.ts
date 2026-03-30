import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { StorageService } from './storage.service';

@Module({
    providers: [MediaService, StorageService],
    exports: [MediaService, StorageService],
})
export class MediaModule {}
