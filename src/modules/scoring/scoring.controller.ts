import { Controller, Get } from '@nestjs/common';
import { ScoringService } from './scoring.service';

@Controller('scoring')
export class ScoringController {
    constructor(private readonly service: ScoringService) {
    }

    @Get('health')
    health() {
        return { status: 'ok', module: 'scoring' };
    }
}
