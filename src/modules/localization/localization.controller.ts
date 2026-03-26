import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { LocalizationService } from './localization.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../../common/audit/audit.service';

@Controller('localization')
export class LocalizationController {
    constructor(
        private readonly service: LocalizationService,
        private readonly audit: AuditService,
    ) {
    }

    @Public()
    @Get('languages')
    listLanguages() {
        return this.service.listLanguages(true);
    }

    @Roles('admin')
    @Post('languages')
    async createLanguage(
        @Body() dto: CreateLanguageDto,
        @CurrentUser() user: any,
        @Req() req: any,
    ) {
        const created = await this.service.createLanguage(dto);
        await this.audit.logAction({
            userId: user.id,
            action: 'create',
            entity: 'Language',
            entityId: created.id,
            data: { code: created.code },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return created;
    }

    @Roles('admin')
    @Patch('languages/:id')
    async updateLanguage(
        @Param('id') id: string,
        @Body() dto: UpdateLanguageDto,
        @CurrentUser() user: any,
        @Req() req: any,
    ) {
        const updated = await this.service.updateLanguage(Number(id), dto);
        await this.audit.logAction({
            userId: user.id,
            action: 'update',
            entity: 'Language',
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
