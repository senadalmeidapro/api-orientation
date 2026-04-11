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
import { TrainingCentersService } from './training-centers.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateTrainingCenterDto, ListTrainingCentersDto, UpdateTrainingCenterDto } from './dto';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('training-centers')
export class TrainingCentersController {
    constructor(private readonly centers: TrainingCentersService) {}

    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get()
    list(@Query() dto: ListTrainingCentersDto) {
        return this.centers.list(dto);
    }

    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get(':id')
    getById(@Param('id') id: string) {
        return this.centers.getById(Number(id));
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Post()
    create(@Body() dto: CreateTrainingCenterDto) {
        return this.centers.create(dto);
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTrainingCenterDto) {
        return this.centers.update(Number(id), dto);
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Delete(':id')
    deactivate(@Param('id') id: string) {
        return this.centers.deactivate(Number(id));
    }
}
