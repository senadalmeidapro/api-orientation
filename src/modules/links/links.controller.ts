import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Throttle } from '@nestjs/throttler';
import {
    CreateLinkCategoryDto,
    CreateLinkDto,
    ListLinksDto,
    UpdateLinkCategoryDto,
    UpdateLinkDto,
} from './dto';
import { LinksService } from './links.service';

@Controller('links')
export class LinksController {
    constructor(private readonly links: LinksService) {}

    @Public()
    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get()
    list(@Query() dto: ListLinksDto) {
        return this.links.list(dto);
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Post()
    createLink(@Body() dto: CreateLinkDto) {
        return this.links.createLink(dto);
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Patch(':id')
    updateLink(@Param('id') id: string, @Body() dto: UpdateLinkDto) {
        return this.links.updateLink(Number(id), dto);
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Delete(':id')
    deleteLink(@Param('id') id: string) {
        return this.links.deleteLink(Number(id));
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 20, ttl: 60 } })
    @Post('categories')
    createCategory(@Body() dto: CreateLinkCategoryDto) {
        return this.links.createCategory(dto);
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 20, ttl: 60 } })
    @Patch('categories/:id')
    updateCategory(@Param('id') id: string, @Body() dto: UpdateLinkCategoryDto) {
        return this.links.updateCategory(Number(id), dto);
    }

    @Roles('ADMIN')
    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Delete('categories/:id')
    deleteCategory(@Param('id') id: string) {
        return this.links.deleteCategory(Number(id));
    }
}
