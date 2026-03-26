import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { CareersService } from './careers.service';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import { GetCareersDto } from './dto/get-careers.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditService } from '../../common/audit/audit.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('careers')
export class CareersController {
    constructor(
        private readonly service: CareersService,
        private readonly audit: AuditService,
    ) {
    }

    @Public()
    @Get()
    list(@Query() dto: GetCareersDto) {
        return this.service.list(dto);
    }

    @Public()
    @Get('id/:id')
    get(@Param('id') id: string) {
        return this.service.getById(Number(id));
    }

    @Roles('admin', 'editor')
    @Post()
    async create(@Body() dto: CreateCareerDto, @CurrentUser() user: any, @Req() req: any) {
        const created = await this.service.create(dto);
        await this.audit.logAction({
            userId: user.id,
            action: 'create',
            entity: 'Career',
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
        @Body() dto: UpdateCareerDto,
        @CurrentUser() user: any,
        @Req() req: any,
    ) {
        const updated = await this.service.update(Number(id), dto);
        await this.audit.logAction({
            userId: user.id,
            action: 'update',
            entity: 'Career',
            entityId: id,
            data: dto as any,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return updated;
    }

    @Roles('admin', 'editor')
    @Delete(':id')
    async remove(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
        const removed = await this.service.remove(Number(id));
        await this.audit.logAction({
            userId: user.id,
            action: 'delete',
            entity: 'Career',
            entityId: id,
            data: {},
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return removed;
    }
}
