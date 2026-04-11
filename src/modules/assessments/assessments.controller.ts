import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { AssessmentsService } from './assessments.service';
import { AbandonAssessmentDto, GetAssessmentDto } from './dto';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('assessments')
export class AssessmentsController {
    constructor(private readonly assessments: AssessmentsService) {}

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get(':assessmentId')
    getById(@Param('assessmentId') assessmentId: string, @Query() query: GetAssessmentDto) {
        return this.assessments.getById(query.sessionToken, assessmentId);
    }

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get(':assessmentId/progress')
    getProgress(@Param('assessmentId') assessmentId: string, @Query() query: GetAssessmentDto) {
        return this.assessments.getProgress(query.sessionToken, assessmentId);
    }

    @Throttle({ default: { limit: 20, ttl: 60 } })
    @Patch(':assessmentId/abandon')
    abandon(@Param('assessmentId') assessmentId: string, @Body() dto: AbandonAssessmentDto) {
        return this.assessments.abandon(dto.sessionToken, assessmentId);
    }
}
