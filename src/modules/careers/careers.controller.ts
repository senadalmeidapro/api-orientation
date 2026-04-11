import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CareersService } from './careers.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateCareerDto, ListCareersDto, UpdateCareerDto } from './dto';
import { Throttle } from '@nestjs/throttler';

@Controller('careers')
export class CareersController {
    constructor(private readonly careers: CareersService) {}

    @Public()
    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get()
    list(@Query() dto: ListCareersDto) {
        return this.careers.list(dto);
    }

    @Public()
    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get(':id')
    getById(@Param('id') id: string) {
        return this.careers.getById(Number(id));
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Post()
    create(@Body() dto: CreateCareerDto) {
        return this.careers.create(dto);
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCareerDto) {
        return this.careers.update(Number(id), dto);
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Delete(':id')
    deactivate(@Param('id') id: string) {
        return this.careers.deactivate(Number(id));
    }
}
