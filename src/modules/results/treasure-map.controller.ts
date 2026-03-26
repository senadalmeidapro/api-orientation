import { Body, Controller, Get, Param, Post, Res, StreamableFile } from '@nestjs/common';
import { TreasureMapService } from './treasure-map.service';
import { CreateTreasureMapDto } from './dto/create-treasure-map.dto';
import { Public } from '../../common/decorators/public.decorator';
import * as fs from 'fs';
import * as path from 'path';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';

@Public()
@Controller('treasure-map')
export class TreasureMapController {
    constructor(private readonly service: TreasureMapService) {
    }

    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Post()
    generate(@Body() dto: CreateTreasureMapDto) {
        return this.service.generate(dto.sessionToken, dto.generatePdf ?? false);
    }

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get('by-token/:sessionToken')
    getBySessionToken(@Param('sessionToken') sessionToken: string) {
        return this.service.getBySessionToken(sessionToken);
    }

    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Get('pdf/:shareToken')
    async getPdf(
        @Param('shareToken') shareToken: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const map = await this.service.getByShareToken(shareToken);
        if (!map.pdfUrl) return res.status(404).json({ error: 'PDF non généré' });

        if (map.pdfUrl.startsWith('http')) {
            return res.redirect(map.pdfUrl);
        }

        const filePath = path.join(process.cwd(), map.pdfUrl);
        if (!fs.existsSync(filePath))
            return res.status(404).json({ error: 'Fichier PDF introuvable' });

        const file = fs.createReadStream(filePath);
        return new StreamableFile(file);
    }

    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get(':shareToken')
    getByShareToken(@Param('shareToken') shareToken: string) {
        return this.service.getByShareToken(shareToken);
    }
}
