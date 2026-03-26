import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OutcomesService } from './outcomes.service';
import { CreateOutcomeDto } from './dto/create-outcome.dto';
import { ListOutcomesDto } from './dto/list-outcomes.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('outcomes')
export class OutcomesController {
    constructor(private readonly service: OutcomesService) {
    }

    @Post()
    create(@Body() dto: CreateOutcomeDto, @CurrentUser() user: any) {
        return this.service.create(dto, user?.id);
    }

    @Roles('admin', 'analyst')
    @Get()
    list(@Query() query: ListOutcomesDto) {
        return this.service.list(query);
    }

    @Get('health')
    health() {
        return this.service.health();
    }
}
