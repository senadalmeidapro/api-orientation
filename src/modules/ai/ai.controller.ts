import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { AiService } from './ai.service';
import { AiCoachDto, AiSummaryDto } from './dto';

@Public()
@Controller('ai')
export class AiController {
    constructor(private readonly service: AiService) {}

    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Post('summary')
    summary(@Body() dto: AiSummaryDto) {
        return this.service.summary(dto);
    }

    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Post('coach')
    coach(@Body() dto: AiCoachDto) {
        return this.service.coach(dto);
    }
}
