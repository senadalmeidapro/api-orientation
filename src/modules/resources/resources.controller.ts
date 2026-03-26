import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ListResourcesDto } from './dto/list-resources.dto';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { CreateResourceTranslationDto } from './dto/create-resource-translation.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../../common/audit/audit.service';

@Controller('resources')
export class ResourcesController {
    constructor(
        private readonly service: ResourcesService,
        private readonly audit: AuditService,
    ) {
    }

    @Public()
    @Get()
    list(@Query() query: ListResourcesDto) {
        return this.service.listResources(query, false);
    }

    @Roles('admin', 'editor')
    @Get('admin/list')
    listAdmin(@Query() query: ListResourcesDto) {
        return this.service.listResources(query, true);
    }

    @Roles('admin', 'editor')
    @Get('admin/:id')
    getOneAdmin(@Param('id') id: string, @Query('lang') lang?: string) {
        return this.service.getResource(Number(id), lang, true);
    }

    @Roles('admin', 'editor')
    @Post()
    async create(@Body() dto: CreateResourceDto, @CurrentUser() user: any, @Req() req: any) {
        const created = await this.service.createResource(dto);
        await this.audit.logAction({
            userId: user.id,
            action: 'create',
            entity: 'Resource',
            entityId: created.id,
            data: { title: created.title },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return created;
    }

    @Roles('admin', 'editor')
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateResourceDto,
        @CurrentUser() user: any,
        @Req() req: any,
    ) {
        const updated = await this.service.updateResource(Number(id), dto);
        await this.audit.logAction({
            userId: user.id,
            action: 'update',
            entity: 'Resource',
            entityId: id,
            data: dto as any,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return updated;
    }

    @Roles('admin', 'editor')
    @Post(':id/translations')
    async addTranslation(
        @Param('id') id: string,
        @Body() dto: CreateResourceTranslationDto,
        @CurrentUser() user: any,
        @Req() req: any,
    ) {
        const created = await this.service.addTranslation(Number(id), dto);
        await this.audit.logAction({
            userId: user.id,
            action: 'translate',
            entity: 'Resource',
            entityId: id,
            data: { languageCode: dto.languageCode },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return created;
    }

    @Get('health')
    health() {
        return this.service.health();
    }

    @Public()
    @Get(':id')
    getOne(@Param('id') id: string, @Query('lang') lang?: string) {
        return this.service.getResource(Number(id), lang, false);
    }
}
