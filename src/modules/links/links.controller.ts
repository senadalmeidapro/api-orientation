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
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Throttle } from '@nestjs/throttler';
import {
    CreateLinkCategoryDto,
    CreateLinkDto,
    ListLinksDto,
    UpdateLinkCategoryDto,
    UpdateLinkDto,
} from './dto';
import { LinksService } from './links.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
    ApiStandardCreatedResponse,
    ApiStandardErrorResponses,
    ApiStandardOkResponse,
} from '../../common/swagger';

@ApiTags('Links')
@ApiBearerAuth('access-token')
@Controller('api/v1/links')
export class LinksController {
    constructor(private readonly links: LinksService) {}

    @ApiOperation({
        summary: 'Lister les catégories de liens',
        description: 'Endpoint public qui retourne les catégories et leurs liens.',
    })
    @ApiStandardOkResponse({
        description: 'Catégories de liens récupérées.',
        dataExample: [
            {
                id: 3,
                name: 'Plateformes de formation',
                links: [{ id: 11, title: 'OpenClassrooms', url: 'https://openclassrooms.com' }],
            },
        ],
    })
    @ApiStandardErrorResponses()
    @Public()
    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get()
    list(@Query() dto: ListLinksDto) {
        return this.links.list(dto);
    }

    @ApiOperation({
        summary: 'Créer un lien',
        description: 'Ajoute un lien dans une catégorie existante (endpoint réservé ADMIN).',
    })
    @ApiBody({
        type: CreateLinkDto,
        description: 'Données de création du lien (titre, URL, catégorie).',
    })
    @ApiStandardCreatedResponse({
        description: 'Lien créé.',
        dataExample: {
            id: 21,
            category_id: 3,
            title: 'Coursera',
            url: 'https://coursera.org',
        },
    })
    @ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
    @Roles('ADMIN')
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Post()
    createLink(@Body() dto: CreateLinkDto) {
        return this.links.createLink(dto);
    }

    @ApiOperation({
        summary: 'Mettre à jour un lien',
        description: 'Met à jour un lien existant (endpoint réservé ADMIN).',
    })
    @ApiParam({
        name: 'id',
        description: 'Identifiant numérique du lien.',
        example: 21,
    })
    @ApiBody({
        type: UpdateLinkDto,
        description: 'Données partielles de mise à jour du lien.',
    })
    @ApiStandardOkResponse({
        description: 'Lien mis à jour.',
        dataExample: {
            id: 21,
            title: 'Coursera (FR)',
            category_id: 3,
        },
    })
    @ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
    @Roles('ADMIN')
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Patch(':id')
    updateLink(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLinkDto) {
        return this.links.updateLink(id, dto);
    }

    @ApiOperation({
        summary: 'Supprimer un lien',
        description: 'Supprime un lien existant (endpoint réservé ADMIN).',
    })
    @ApiParam({
        name: 'id',
        description: 'Identifiant numérique du lien.',
        example: 21,
    })
    @ApiStandardOkResponse({
        description: 'Lien supprimé.',
        dataExample: {
            id: 21,
            title: 'Coursera',
        },
    })
    @ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
    @Roles('ADMIN')
    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Delete(':id')
    deleteLink(@Param('id', ParseIntPipe) id: number) {
        return this.links.deleteLink(id);
    }

    @ApiOperation({
        summary: 'Créer une catégorie de liens',
        description: 'Crée une nouvelle catégorie de liens (endpoint réservé ADMIN).',
    })
    @ApiBody({
        type: CreateLinkCategoryDto,
        description: 'Nom de la catégorie à créer.',
    })
    @ApiStandardCreatedResponse({
        description: 'Catégorie créée.',
        dataExample: {
            id: 8,
            name: 'Bourses et financements',
        },
    })
    @ApiStandardErrorResponses({ includeUnauthorized: true })
    @Roles('ADMIN')
    @Throttle({ default: { limit: 20, ttl: 60 } })
    @Post('categories')
    createCategory(@Body() dto: CreateLinkCategoryDto) {
        return this.links.createCategory(dto);
    }

    @ApiOperation({
        summary: 'Mettre à jour une catégorie de liens',
        description: 'Met à jour une catégorie existante (endpoint réservé ADMIN).',
    })
    @ApiParam({
        name: 'id',
        description: 'Identifiant numérique de la catégorie.',
        example: 8,
    })
    @ApiBody({
        type: UpdateLinkCategoryDto,
        description: 'Nom partiel ou complet de la catégorie.',
    })
    @ApiStandardOkResponse({
        description: 'Catégorie mise à jour.',
        dataExample: {
            id: 8,
            name: 'Bourses étudiantes',
        },
    })
    @ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
    @Roles('ADMIN')
    @Throttle({ default: { limit: 20, ttl: 60 } })
    @Patch('categories/:id')
    updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLinkCategoryDto) {
        return this.links.updateCategory(id, dto);
    }

    @ApiOperation({
        summary: 'Supprimer une catégorie de liens',
        description: 'Supprime une catégorie existante (endpoint réservé ADMIN).',
    })
    @ApiParam({
        name: 'id',
        description: 'Identifiant numérique de la catégorie.',
        example: 8,
    })
    @ApiStandardOkResponse({
        description: 'Catégorie supprimée.',
        dataExample: {
            id: 8,
            name: 'Bourses étudiantes',
        },
    })
    @ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
    @Roles('ADMIN')
    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Delete('categories/:id')
    deleteCategory(@Param('id', ParseIntPipe) id: number) {
        return this.links.deleteCategory(id);
    }
}
