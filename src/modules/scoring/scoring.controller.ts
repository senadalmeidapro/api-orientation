import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('scoring')
export class ScoringController {
    @Get('health')
    health() {
        return { status: 'ok', module: 'scoring' };
    }
}
