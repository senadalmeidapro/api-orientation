import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res } from '@nestjs/common';
import { ContactService } from './contact.service';
import { Public } from '../../common/decorators/public.decorator';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';
import { ListContactRequestsDto } from './dto/list-contact-requests.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateContactRequestDto } from './dto/update-contact-request.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ExportContactRequestsDto } from './dto/export-contact-requests.dto';
import { csvHeader, csvRow } from '../../common/utils/csv.util';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuditService } from '../../common/audit/audit.service';

@Controller('contact')
export class ContactController {
    constructor(
        private readonly service: ContactService,
        private readonly audit: AuditService,
    ) {
    }

    @Public()
    @Post()
    create(@Body() dto: CreateContactRequestDto, @CurrentUser() user: any) {
        return this.service.create(dto, user?.id);
    }

    @Roles('admin', 'analyst')
    @Get()
    list(@Query() query: ListContactRequestsDto) {
        return this.service.list(query);
    }

    @Roles('admin', 'analyst')
    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Get('export')
    async export(@Query() query: ExportContactRequestsDto, @Res() res: Response) {
        const headers = [
            'id',
            'name',
            'email',
            'phone',
            'requestType',
            'message',
            'preferredDate',
            'preferredTime',
            'status',
            'assignedTo',
            'response',
            'createdAt',
            'updatedAt',
        ];
        const format = query.format ?? 'csv';
        res.setHeader('Content-Type', format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=\"contact_requests.csv\"');
        res.status(200);
        res.write(csvHeader(headers) + '\n');

        const limit = Math.min(query.limit ?? 50000, 200000);
        let remaining = limit;
        let cursor: number | undefined;
        const batchSize = 1000;
        while (remaining > 0) {
            const take = Math.min(batchSize, remaining);
            const batch = await this.service.listBatch(
                { status: query.status, requestType: query.requestType, email: query.email },
                cursor,
                take,
            );
            if (!batch.length) break;
            for (const r of batch as any[]) {
                const row = {
                    id: r.id,
                    name: r.name,
                    email: r.email,
                    phone: r.phone ?? '',
                    requestType: r.requestType,
                    message: r.message,
                    preferredDate: r.preferredDate ? r.preferredDate.toISOString() : '',
                    preferredTime: r.preferredTime ?? '',
                    status: r.status,
                    assignedTo: r.assignedTo ?? '',
                    response: r.response ?? '',
                    createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
                    updatedAt: r.updatedAt?.toISOString?.() ?? r.updatedAt,
                };
                res.write(csvRow(headers, row) + '\n');
            }
            cursor = batch[batch.length - 1].id;
            remaining -= batch.length;
        }
        res.end();
    }

    @Roles('admin')
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateContactRequestDto,
        @CurrentUser() user: any,
        @Req() req: any,
    ) {
        const updated = await this.service.update(Number(id), dto);
        await this.audit.logAction({
            userId: user.id,
            action: 'update',
            entity: 'ContactRequest',
            entityId: id,
            data: dto as any,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return updated;
    }

    @Get('health')
    health() {
        return this.service.health();
    }
}
