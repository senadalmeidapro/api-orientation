import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionTokenParam } from './dto/session-token.param';
import { Public } from '../../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateSessionProfileDto } from './dto/update-session-profile.dto';

@Public()
@Controller('sessions')
export class SessionsController {
    constructor(private readonly service: SessionsService) {}

    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Post()
    create(@Body() dto: CreateSessionDto) {
        return this.service.createSession(dto);
    }

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get(':sessionToken')
    getByToken(@Param() params: SessionTokenParam) {
        return this.service.getByToken(params.sessionToken);
    }

    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Post(':sessionToken/assessments')
    createAssessment(@Param() params: SessionTokenParam, @Body() dto: CreateAssessmentDto) {
        return this.service.createAssessmentForSession(params.sessionToken, dto);
    }

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get(':sessionToken/assessments')
    listAssessments(@Param() params: SessionTokenParam) {
        return this.service.listAssessments(params.sessionToken);
    }

    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Patch(':sessionToken/profile')
    updateProfile(@Param() params: SessionTokenParam, @Body() dto: UpdateSessionProfileDto) {
        return this.service.updateProfile(params.sessionToken, dto);
    }
}
