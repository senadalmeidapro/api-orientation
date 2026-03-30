import { Controller, Get, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { GetPhase1QuestionsDto } from './dto/get-phase1-questions.dto';
import { GetPhase2QuestionsDto } from './dto/get-phase2-questions.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('questions')
export class QuestionsController {
    constructor(private readonly service: QuestionsService) {}

    @Public()
    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get('phase1')
    getPhase1(@Query() query: GetPhase1QuestionsDto) {
        return this.service.getPhase1Questions(query);
    }

    @Public()
    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get('phase2')
    getPhase2(@Query() query: GetPhase2QuestionsDto) {
        return this.service.getPhase2Questions(query);
    }
}
