import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Post,
    Res,
    StreamableFile,
    UseGuards,
} from '@nestjs/common';
import { TreasureMapService } from './treasure-map.service';
import { CreateTreasureMapDto } from './dto/create-treasure-map.dto';
import * as fs from 'fs';
import * as path from 'path';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiProduces,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    ApiStandardCreatedResponse,
    ApiStandardErrorResponses,
    ApiStandardOkResponse,
} from '../../common/swagger';

@ApiTags('Treasure map')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
@Controller('treasure-map')
export class TreasureMapController {
    constructor(private readonly service: TreasureMapService) {}

    @ApiOperation({
        summary: 'Générer une treasure map',
        description:
            'Construit (ou met à jour) la carte de résultat d’un assessment et peut générer un PDF shareable.',
    })
    @ApiBody({
        type: CreateTreasureMapDto,
        description: 'Token de session, assessmentId optionnel et drapeau `generatePdf`.',
    })
    @ApiStandardCreatedResponse({
        description: 'Treasure map générée.',
        dataExample: {
            id: 'clx-map-id',
            assessment_id: 'clx-assessment-id',
            share_token: '57ecfcd8-f5d6-4a2f-9ab8-d2a684be9777',
            pdf_url: 'storage/treasure-maps/clx-map-id.pdf',
        },
    })
    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Post()
    generate(@Body() dto: CreateTreasureMapDto) {
        return this.service.generate(dto.sessionToken, dto.assessmentId, dto.generatePdf ?? false);
    }

    @ApiOperation({
        summary: 'Récupérer la treasure map par session token',
        description: 'Retourne la dernière treasure map associée à une session.',
    })
    @ApiParam({
        name: 'sessionToken',
        description: 'Token de session.',
        example: '4ce2f33a-8dfe-4b20-a5f2-9d3d8b6d2dcd',
    })
    @ApiStandardOkResponse({
        description: 'Treasure map récupérée.',
        dataExample: {
            id: 'clx-map-id',
            share_token: '57ecfcd8-f5d6-4a2f-9ab8-d2a684be9777',
            map_data: { phase1_code: 'RIA', phase2_code: 'RIS' },
        },
    })
    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get('by-token/:sessionToken')
    getBySessionToken(@Param('sessionToken') sessionToken: string) {
        return this.service.getBySessionToken(sessionToken);
    }

    @ApiOperation({
        summary: 'Télécharger ou rediriger vers le PDF de la treasure map',
        description:
            'Retourne le fichier PDF local (application/pdf) ou redirige vers une URL distante si le PDF est hébergé.',
    })
    @ApiParam({
        name: 'shareToken',
        description: 'Token de partage de la treasure map.',
        example: '57ecfcd8-f5d6-4a2f-9ab8-d2a684be9777',
    })
    @ApiProduces('application/pdf')
    @ApiOkResponse({
        description: 'Contenu PDF renvoyé en flux binaire.',
        schema: {
            type: 'string',
            format: 'binary',
        },
    })
    @ApiResponse({
        status: 302,
        description: 'Redirection vers un PDF distant.',
    })
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Get('pdf/:shareToken')
    async getPdf(
        @Param('shareToken') shareToken: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const map = await this.service.getByShareToken(shareToken);
        if (!map.pdf_url) {
            throw new NotFoundException('PDF non généré');
        }

        if (map.pdf_url.startsWith('http')) {
            return res.redirect(map.pdf_url);
        }

        const filePath = path.join(process.cwd(), map.pdf_url);
        if (!fs.existsSync(filePath)) {
            throw new NotFoundException('Fichier PDF introuvable');
        }

        const file = fs.createReadStream(filePath);
        return new StreamableFile(file);
    }

    @ApiOperation({
        summary: 'Récupérer la treasure map par share token',
        description: 'Retourne la carte partageable identifiée par le token de partage.',
    })
    @ApiParam({
        name: 'shareToken',
        description: 'Token de partage de la treasure map.',
        example: '57ecfcd8-f5d6-4a2f-9ab8-d2a684be9777',
    })
    @ApiStandardOkResponse({
        description: 'Treasure map récupérée via share token.',
        dataExample: {
            id: 'clx-map-id',
            share_token: '57ecfcd8-f5d6-4a2f-9ab8-d2a684be9777',
            view_count: 12,
        },
    })
    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get(':shareToken')
    getByShareToken(@Param('shareToken') shareToken: string) {
        return this.service.getByShareToken(shareToken);
    }
}
