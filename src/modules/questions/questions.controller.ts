import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { GetPhase1QuestionsDto } from './dto/get-phase1-questions.dto';
import { GetPhase2QuestionsDto } from './dto/get-phase2-questions.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreatePhase1QuestionDto } from './dto/create-phase1-question.dto';
import { UpdatePhase1QuestionDto } from './dto/update-phase1-question.dto';
import { CreatePhase2QuestionDto } from './dto/create-phase2-question.dto';
import { UpdatePhase2QuestionDto } from './dto/update-phase2-question.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('questions')
export class QuestionsController {
    constructor(private readonly service: QuestionsService) {
    }

    @Public()
    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get('phase1')
    getPhase1(@Query() query: GetPhase1QuestionsDto) {
        return this.service.getPhase1Questions(query);
    }

    @Roles('admin', 'editor')
    @Post('phase1')
    async createPhase1(@Body() dto: CreatePhase1QuestionDto) {
        return this.service.createPhase1Question(dto);
    }

    @Roles('admin', 'editor')
    @Patch('phase1/:id')
    async updatePhase1(@Param('id') id: string, @Body() dto: UpdatePhase1QuestionDto) {
        return this.service.updatePhase1Question(Number(id), dto);
    }

    @Public()
    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get('phase2')
    getPhase2(@Query() query: GetPhase2QuestionsDto) {
        return this.service.getPhase2Questions(query);
    }

    @Roles('admin', 'editor')
    @Post('phase2')
    async createPhase2(@Body() dto: CreatePhase2QuestionDto) {
        return this.service.createPhase2Question(dto);
    }

    @Roles('admin', 'editor')
    @Patch('phase2/:id')
    async updatePhase2(@Param('id') id: string, @Body() dto: UpdatePhase2QuestionDto) {
        return this.service.updatePhase2Question(Number(id), dto);
    }
}
