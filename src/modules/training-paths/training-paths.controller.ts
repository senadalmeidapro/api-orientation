import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Throttle } from '@nestjs/throttler';
import { TrainingPathsService } from './training-paths.service';
import { CreateTrainingPathDto, ListTrainingPathsDto, UpdateTrainingPathDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('training-paths')
export class TrainingPathsController {
    constructor(private readonly paths: TrainingPathsService) {}

    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get()
    list(@Query() dto: ListTrainingPathsDto) {
        return this.paths.list(dto);
    }

    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get(':id')
    getById(@Param('id') id: string) {
        return this.paths.getById(Number(id));
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Post()
    create(@Body() dto: CreateTrainingPathDto) {
        return this.paths.create(dto);
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTrainingPathDto) {
        return this.paths.update(Number(id), dto);
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Delete(':id')
    deactivate(@Param('id') id: string) {
        return this.paths.deactivate(Number(id));
    }
}
