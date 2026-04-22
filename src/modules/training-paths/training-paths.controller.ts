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
    UseGuards,
} from '@nestjs/common';
import { roles } from '../../common/decorators/roles.decorator';
import { Throttle } from '@nestjs/throttler';
import { TrainingPathsService } from './training-paths.service';
import { CreateTrainingPathDto, ListTrainingPathsDto, UpdateTrainingPathDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
// import {
//     ApiStandardCreatedResponse,
//     ApiStandardErrorResponses,
//     ApiStandardOkResponse,
// } from '../../common/swagger';

@ApiTags('Training paths')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
// @ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
@Controller('api/v1/training-paths')
export class TrainingPathsController {
    constructor(private readonly paths: TrainingPathsService) {}

    @ApiOperation({
        summary: 'Lister les parcours de formation',
        description:
            'Retourne les parcours de formation filtrables par carrière, institution et état d’activation.',
    })
    // @ApiStandardOkResponse({
    //     description: 'Parcours de formation récupérés.',
    //     dataExample: [
    //         {
    //             id: 14,
    //             name: 'Licence Informatique',
    //             career_id: 12,
    //             institution_id: 6,
    //             is_active: true,
    //         },
    //     ],
    // })
    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get()
    list(@Query() dto: ListTrainingPathsDto) {
        return this.paths.list(dto);
    }

    @ApiOperation({
        summary: 'Récupérer un parcours de formation par ID',
        description: 'Retourne le détail d’un parcours de formation.',
    })
    @ApiParam({
        name: 'id',
        description: 'Identifiant numérique du parcours.',
        example: 14,
    })
    // @ApiStandardOkResponse({
    //     description: 'Parcours de formation récupéré.',
    //     dataExample: {
    //         id: 14,
    //         name: 'Licence Informatique',
    //         career: { id: 12, name: 'Ingénieur logiciel' },
    //         institution: { id: 6, name: 'Institut Supérieur Technique' },
    //     },
    // })
    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get(':id')
    getById(@Param('id', ParseIntPipe) id: number) {
        return this.paths.getById(id);
    }

    @ApiOperation({
        summary: 'Créer un parcours de formation',
        description: 'Crée un parcours de formation (endpoint réservé ADMIN).',
    })
    @ApiBody({
        type: CreateTrainingPathDto,
        description: 'Données de création du parcours.',
    })
    // @ApiStandardCreatedResponse({
    //     description: 'Parcours de formation créé.',
    //     dataExample: {
    //         id: 33,
    //         name: 'Bootcamp Data Science',
    //         career_id: 44,
    //         institution_id: 7,
    //     },
    // })
    @roles('ADMIN')
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Post()
    create(@Body() dto: CreateTrainingPathDto) {
        return this.paths.create(dto);
    }

    @ApiOperation({
        summary: 'Mettre à jour un parcours de formation',
        description: 'Mise à jour partielle d’un parcours (endpoint réservé ADMIN).',
    })
    @ApiParam({
        name: 'id',
        description: 'Identifiant numérique du parcours.',
        example: 14,
    })
    @ApiBody({
        type: UpdateTrainingPathDto,
        description: 'Données partielles de mise à jour.',
    })
    // @ApiStandardOkResponse({
    //     description: 'Parcours de formation mis à jour.',
    //     dataExample: {
    //         id: 14,
    //         name: 'Licence Informatique (mise à jour)',
    //         is_active: true,
    //     },
    // })
    @roles('ADMIN')
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTrainingPathDto) {
        return this.paths.update(id, dto);
    }

    @ApiOperation({
        summary: 'Désactiver un parcours de formation',
        description: 'Passe `is_active` à `false` pour le parcours ciblé (endpoint réservé ADMIN).',
    })
    @ApiParam({
        name: 'id',
        description: 'Identifiant numérique du parcours.',
        example: 14,
    })
    // @ApiStandardOkResponse({
    //     description: 'Parcours de formation désactivé.',
    //     dataExample: {
    //         id: 14,
    //         is_active: false,
    //     },
    // })
    @roles('ADMIN')
    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Delete(':id')
    deactivate(@Param('id', ParseIntPipe) id: number) {
        return this.paths.deactivate(id);
    }
}
