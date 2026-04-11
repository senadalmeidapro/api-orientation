import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { AiChatDto, AiCoachDto, AiSummaryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Public } from '../../common/decorators';

@Controller('ai')
export class AiController {
    constructor(private readonly service: AiService) {}

    @Throttle({ default: { limit: 10, ttl: 60 } })
    @UseGuards(JwtAuthGuard)
    @Post('summary')
    summary(@Body() dto: AiSummaryDto) {
        return this.service.summary(dto);
    }

    @Throttle({ default: { limit: 10, ttl: 60 } })
    @UseGuards(JwtAuthGuard)
    @Post('coach')
    coach(@Body() dto: AiCoachDto) {
        return this.service.coach(dto);
    }

    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Public()
    @Post('chat')
    chat(@Body() dto: AiChatDto) {
        return this.service.chat(dto);
    }
}
