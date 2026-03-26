import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { ListFeedbackDto } from './dto/list-feedback.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('feedback')
export class FeedbackController {
    constructor(private readonly service: FeedbackService) {
    }

    @Post()
    create(@Body() dto: CreateFeedbackDto, @CurrentUser() user: any) {
        return this.service.create(dto, user?.id);
    }

    @Roles('admin', 'analyst')
    @Get()
    list(@Query() query: ListFeedbackDto) {
        return this.service.list(query);
    }

    @Get('health')
    health() {
        return this.service.health();
    }
}
