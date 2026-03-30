import { Body, Controller, Post } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { CreatePhase1ResponsesDto } from './dto/create-phase1-responses.dto';
import { CreatePhase2ResponsesDto } from './dto/create-phase2-responses.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@Public()
@Controller('responses')
export class ResponsesController {
    constructor(private readonly service: ResponsesService) {}

    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Post('phase1')
    savePhase1(@Body() dto: CreatePhase1ResponsesDto) {
        return this.service.savePhase1(dto);
    }

    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Post('phase2')
    savePhase2(@Body() dto: CreatePhase2ResponsesDto) {
        return this.service.savePhase2(dto);
    }
}
