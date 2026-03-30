import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Controller('scoring')
export class ScoringController {
    @Get('health')
    health() {
        return { status: 'ok', module: 'scoring' };
    }
}
