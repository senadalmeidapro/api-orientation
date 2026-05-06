import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { publicDecorator } from '@common/decorators/public.decorator';
import { roles } from '@common/decorators/roles.decorator';
import { CreateResourceDto, ListResourcesDto, UpdateResourceDto } from './dto';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
// import {
//     ApiStandardCreatedResponse,
//     ApiStandardErrorResponses,
//     ApiStandardOkResponse,
// } from '@common/swagger';

@ApiTags('Resources')
@ApiBearerAuth('access-token')
@Controller('api/v1/resources')
export class ResourcesController {
    constructor(private readonly resources: ResourcesService) {}

    @ApiOperation({
        summary: 'Lister les ressources publiées',
        description:
            'Endpoint public de consultation des ressources. `publishedOnly` est forcé à `true` si absent.',
    })
    // @ApiStandardOkResponse({
    //     description: 'Liste des ressources publiques récupérée.',
    //     dataExample: [
    //         {
    //             id: 101,
    //             title: 'Guide de découverte des métiers',
    //             category: 'guides',
    //             is_published: true,
    //         },
    //     ],
    // })
    // @ApiStandardErrorResponses()
    @publicDecorator()
    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get()
    list(@Query() dto: ListResourcesDto) {
        return this.resources.list({ ...dto, publishedOnly: dto.publishedOnly ?? true });
    }

    @ApiOperation({
        summary: 'Lister les ressources (admin)',
        description: 'Liste complète des ressources, publiées ou non (endpoint réservé ADMIN).',
    })
    // @ApiStandardOkResponse({
    //     description: 'Liste des ressources (admin) récupérée.',
    //     dataExample: [
    //         {
    //             id: 101,
    //             title: 'Guide de découverte des métiers',
    //             is_published: false,
    //         },
    //     ],
    // })
    // @ApiStandardErrorResponses({ includeUnauthorized: true })
    @roles('ADMIN')
    @Throttle({ default: { limit: 60, ttl: 60 } })
    @Get('admin')
    listAdmin(@Query() dto: ListResourcesDto) {
        return this.resources.list(dto);
    }

    @ApiOperation({
        summary: 'Récupérer une ressource par ID',
        description: 'Endpoint public de détail ressource.',
    })
    @ApiParam({
        name: 'id',
        description: 'Identifiant numérique de la ressource.',
        example: 101,
    })
    // @ApiStandardOkResponse({
    //     description: 'Ressource récupérée.',
    //     dataExample: {
    //         id: 101,
    //         title: 'Guide de découverte des métiers',
    //         content_type: 'article',
    //         related_careers: [],
    //     },
    // })
    // @ApiStandardErrorResponses({ includeNotFound: true })
    @publicDecorator()
    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get(':id')
    getById(@Param('id', ParseIntPipe) id: number) {
        return this.resources.getById(id);
    }

    @ApiOperation({
        summary: 'Créer une ressource',
        description: 'Création d’une ressource éditoriale (endpoint réservé ADMIN).',
    })
    @ApiBody({
        type: CreateResourceDto,
        description: 'Données de création ressource.',
    })
    // @ApiStandardCreatedResponse({
    //     description: 'Ressource créée.',
    //     dataExample: {
    //         id: 201,
    //         title: 'Fiche métier Développeur backend',
    //         is_published: false,
    //     },
    // })
    // @ApiStandardErrorResponses({ includeUnauthorized: true })
    @roles('ADMIN')
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Post()
    create(@Body() dto: CreateResourceDto) {
        return this.resources.create(dto);
    }

    @ApiOperation({
        summary: 'Mettre à jour une ressource',
        description: 'Mise à jour partielle d’une ressource (endpoint réservé ADMIN).',
    })
    @ApiParam({
        name: 'id',
        description: 'Identifiant numérique de la ressource.',
        example: 101,
    })
    @ApiBody({
        type: UpdateResourceDto,
        description: 'Données partielles de mise à jour.',
    })
    // @ApiStandardOkResponse({
    //     description: 'Ressource mise à jour.',
    //     dataExample: {
    //         id: 101,
    //         title: 'Guide de découverte des métiers (édition 2026)',
    //         is_published: true,
    //     },
    // })
    // @ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
    @roles('ADMIN')
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateResourceDto) {
        return this.resources.update(id, dto);
    }

    @ApiOperation({
        summary: 'Supprimer une ressource',
        description:
            'Suppression définitive de la ressource et des liens de relation associés (endpoint réservé ADMIN).',
    })
    @ApiParam({
        name: 'id',
        description: 'Identifiant numérique de la ressource.',
        example: 101,
    })
    // @ApiStandardOkResponse({
    //     description: 'Ressource supprimée.',
    //     dataExample: {
    //         id: 101,
    //         title: 'Guide de découverte des métiers',
    //     },
    // })
    // @ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
    @roles('ADMIN')
    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.resources.remove(id);
    }
}
