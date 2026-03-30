import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionTokenParam } from './dto/session-token.param';
import { Public } from '../../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

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
}
