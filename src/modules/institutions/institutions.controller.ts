import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ListInstitutionsDto } from './dto/list-institutions.dto';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { CreateInstitutionTranslationDto } from './dto/create-institution-translation.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../../common/audit/audit.service';

@Controller('institutions')
export class InstitutionsController {
    constructor(
        private readonly service: InstitutionsService,
        private readonly audit: AuditService,
    ) {
    }

    @Public()
    @Get()
    list(@Query() query: ListInstitutionsDto) {
        return this.service.listInstitutions(query, false);
    }

    @Roles('admin', 'editor')
    @Get('admin/list')
    listAdmin(@Query() query: ListInstitutionsDto) {
        return this.service.listInstitutions(query, true);
    }

    @Roles('admin', 'editor')
    @Get('admin/:id')
    getAdmin(@Param('id') id: string, @Query('lang') lang?: string) {
        return this.service.getInstitution(Number(id), lang, true);
    }

    @Roles('admin', 'editor')
    @Post()
    async create(@Body() dto: CreateInstitutionDto, @CurrentUser() user: any, @Req() req: any) {
        const created = await this.service.createInstitution(dto);
        await this.audit.logAction({
            userId: user.id,
            action: 'create',
            entity: 'TrainingInstitution',
            entityId: created.id,
            data: { name: created.name },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return created;
    }

    @Roles('admin', 'editor')
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateInstitutionDto,
        @CurrentUser() user: any,
        @Req() req: any,
    ) {
        const updated = await this.service.updateInstitution(Number(id), dto);
        await this.audit.logAction({
            userId: user.id,
            action: 'update',
            entity: 'TrainingInstitution',
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
        @Body() dto: CreateInstitutionTranslationDto,
        @CurrentUser() user: any,
        @Req() req: any,
    ) {
        const created = await this.service.addTranslation(Number(id), dto);
        await this.audit.logAction({
            userId: user.id,
            action: 'translate',
            entity: 'TrainingInstitution',
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
        return this.service.getInstitution(Number(id), lang, false);
    }
}
