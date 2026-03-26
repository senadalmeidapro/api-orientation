import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ListAnnouncementsDto } from './dto/list-announcements.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { CreateAnnouncementTranslationDto } from './dto/create-announcement-translation.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../../common/audit/audit.service';

@Controller('announcements')
export class AnnouncementsController {
    constructor(
        private readonly service: AnnouncementsService,
        private readonly audit: AuditService,
    ) {
    }

    @Public()
    @Get()
    list(@Query() query: ListAnnouncementsDto) {
        return this.service.listAnnouncements(query, false);
    }

    @Roles('admin', 'editor')
    @Get('admin/list')
    listAdmin(@Query() query: ListAnnouncementsDto) {
        return this.service.listAnnouncements(query, true);
    }

    @Roles('admin', 'editor')
    @Get('admin/:id')
    getAdmin(@Param('id') id: string, @Query('lang') lang?: string) {
        return this.service.getAnnouncement(Number(id), lang, true);
    }

    @Roles('admin', 'editor')
    @Post()
    async create(@Body() dto: CreateAnnouncementDto, @CurrentUser() user: any, @Req() req: any) {
        const created = await this.service.createAnnouncement(dto);
        await this.audit.logAction({
            userId: user.id,
            action: 'create',
            entity: 'Announcement',
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
        @Body() dto: UpdateAnnouncementDto,
        @CurrentUser() user: any,
        @Req() req: any,
    ) {
        const updated = await this.service.updateAnnouncement(Number(id), dto);
        await this.audit.logAction({
            userId: user.id,
            action: 'update',
            entity: 'Announcement',
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
        @Body() dto: CreateAnnouncementTranslationDto,
        @CurrentUser() user: any,
        @Req() req: any,
    ) {
        const created = await this.service.addTranslation(Number(id), dto);
        await this.audit.logAction({
            userId: user.id,
            action: 'translate',
            entity: 'Announcement',
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
        return this.service.getAnnouncement(Number(id), lang, false);
    }
}
