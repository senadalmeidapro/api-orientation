import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateResourceDto, ListResourcesDto, UpdateResourceDto } from './dto';
import { Throttle } from '@nestjs/throttler';

@Controller('resources')
export class ResourcesController {
    constructor(private readonly resources: ResourcesService) {}

    @Public()
    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get()
    list(@Query() dto: ListResourcesDto) {
        return this.resources.list({ ...dto, publishedOnly: dto.publishedOnly ?? true });
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get('admin')
    listAdmin(@Query() dto: ListResourcesDto) {
        return this.resources.list(dto);
    }

    @Public()
    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get(':id')
    getById(@Param('id') id: string) {
        return this.resources.getById(Number(id));
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Post()
    create(@Body() dto: CreateResourceDto) {
        return this.resources.create(dto);
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateResourceDto) {
        return this.resources.update(Number(id), dto);
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.resources.remove(Number(id));
    }
}
