import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ResultsService } from './results.service';
import { ComputeResultDto } from './dto/compute-result.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@Public()
@Controller('results')
export class ResultsController {
    constructor(private readonly service: ResultsService) {}

    @Throttle({ default: { limit: 20, ttl: 60 } })
    @Post('compute')
    compute(@Body() dto: ComputeResultDto) {
        return this.service.compute(dto);
    }

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get('by-token/:sessionToken')
    getByToken(@Param('sessionToken') sessionToken: string) {
        return this.service.getByToken(sessionToken);
    }

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get(':sessionId')
    getBySessionId(@Param('sessionId') sessionId: string) {
        return this.service.getBySessionId(sessionId);
    }
}
