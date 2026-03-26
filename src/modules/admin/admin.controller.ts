import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateRiasecTypeDto } from './dto/create-riasec-type.dto';
import { UpdateRiasecTypeDto } from './dto/update-riasec-type.dto';
import { CreateAptitudeOptionDto } from './dto/create-aptitude-option.dto';
import { UpdateAptitudeOptionDto } from './dto/update-aptitude-option.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../../common/audit/audit.service';
import { ListAuditLogsDto } from './dto/list-audit-logs.dto';

@Controller('admin')
export class AdminController {
    constructor(
        private readonly service: AdminService,
        private readonly audit: AuditService,
    ) {
    }

    @Roles('admin', 'editor')
    @Get('riasec-types')
    listRiasec() {
        return this.service.listRiasecTypes();
    }

    @Roles('admin', 'editor')
    @Post('riasec-types')
    async createRiasec(
        @Body() dto: CreateRiasecTypeDto,
        @CurrentUser() user: any,
        @Req() req: any,
    ) {
        const created = await this.service.createRiasecType(dto);
        await this.audit.logAction({
            userId: user.id,
            action: 'create',
            entity: 'RiasecType',
            entityId: created.id,
            data: { name: created.name },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return created;
    }

    @Roles('admin', 'editor')
    @Patch('riasec-types/:id')
    async updateRiasec(
        @Param('id') id: 'R' | 'I' | 'A' | 'S' | 'E' | 'C',
        @Body() dto: UpdateRiasecTypeDto,
        @CurrentUser() user: any,
        @Req() req: any,
    ) {
        const updated = await this.service.updateRiasecType(id, dto);
        await this.audit.logAction({
            userId: user.id,
            action: 'update',
            entity: 'RiasecType',
            entityId: id,
            data: dto as any,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return updated;
    }

    @Roles('admin', 'editor')
    @Get('aptitude-options')
    listAptitudeOptions() {
        return this.service.listAptitudeOptions();
    }

    @Roles('admin', 'editor')
    @Post('aptitude-options')
    async createAptitudeOption(
        @Body() dto: CreateAptitudeOptionDto,
        @CurrentUser() user: any,
        @Req() req: any,
    ) {
        const created = await this.service.createAptitudeOption(dto);
        await this.audit.logAction({
            userId: user.id,
            action: 'create',
            entity: 'AptitudeResponseOption',
            entityId: created.id,
            data: { value: created.value },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return created;
    }

    @Roles('admin', 'editor')
    @Patch('aptitude-options/:id')
    async updateAptitudeOption(
        @Param('id') id: string,
        @Body() dto: UpdateAptitudeOptionDto,
        @CurrentUser() user: any,
        @Req() req: any,
    ) {
        const updated = await this.service.updateAptitudeOption(Number(id), dto);
        await this.audit.logAction({
            userId: user.id,
            action: 'update',
            entity: 'AptitudeResponseOption',
            entityId: id,
            data: dto as any,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return updated;
    }

    @Roles('admin', 'analyst')
    @Get('audit-logs')
    listAuditLogs(@Query() query: ListAuditLogsDto) {
        return this.service.listAuditLogs(query);
    }

    @Roles('admin')
    @Get('roles')
    listRoles() {
        return this.service.getRolesCatalog();
    }

    @Get('health')
    health() {
        return this.service.health();
    }
}
