import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  health() {
    return { status: 'ok', module: 'media' };
  }
}
