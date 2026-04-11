import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Throttle } from '@nestjs/throttler';
import { AnalyticsService } from './analytics.service';
import {
    AnalyticsSummaryDto,
    CreateFeedbackDto,
    CreateInteractionDto,
    CreateOutcomeDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analytics: AnalyticsService) {}

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Post('interactions')
    createInteraction(@Body() dto: CreateInteractionDto) {
        return this.analytics.createInteraction(dto);
    }

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Post('feedbacks')
    createFeedback(@Body() dto: CreateFeedbackDto) {
        return this.analytics.createFeedback(dto);
    }

    @Throttle({ default: { limit: 20, ttl: 60 } })
    @Post('outcomes')
    createOutcome(@Body() dto: CreateOutcomeDto) {
        return this.analytics.createOutcome(dto);
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 20, ttl: 60 } })
    @Get('summary')
    getSummary(@Query() dto: AnalyticsSummaryDto) {
        return this.analytics.getSummary(dto);
    }
}
