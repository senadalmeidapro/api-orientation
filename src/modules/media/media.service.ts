import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaService {
    health() {
        return { status: 'ok', module: 'media' };
    }
}
