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
import { TrainingCentersService } from './training-centers.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateTrainingCenterDto, ListTrainingCentersDto, UpdateTrainingCenterDto } from './dto';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
// import {
//     ApiStandardCreatedResponse,
//     ApiStandardErrorResponses,
//     ApiStandardOkResponse,
// } from '../../common/swagger';

@ApiTags('Training centers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
// @ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
@Controller('api/v1/training-centers')
export class TrainingCentersController {
    constructor(private readonly centers: TrainingCentersService) {}

    @ApiOperation({
        summary: 'Lister les centres de formation',
        description:
            'Retourne les centres de formation avec filtres (texte, ville, département, actif).',
    })
    // @ApiStandardOkResponse({
    //     description: 'Centres de formation récupérés.',
    //     dataExample: [
    //         {
    //             id: 6,
    //             name: 'Institut Supérieur Technique',
    //             city: 'Dakar',
    //             department: 'Informatique',
    //             is_active: true,
    //         },
    //     ],
    // })
    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get()
    list(@Query() dto: ListTrainingCentersDto) {
        return this.centers.list(dto);
    }

    @ApiOperation({
        summary: 'Récupérer un centre de formation par ID',
        description: 'Retourne le détail d’un centre de formation.',
    })
    @ApiParam({
        name: 'id',
        description: 'Identifiant numérique du centre.',
        example: 6,
    })
    // @ApiStandardOkResponse({
    //     description: 'Centre de formation récupéré.',
    //     dataExample: {
    //         id: 6,
    //         name: 'Institut Supérieur Technique',
    //         careers: [],
    //         trainingPaths: [],
    //     },
    // })
    @Throttle({ default: { limit: 120, ttl: 60 } })
    @Get(':id')
    getById(@Param('id', ParseIntPipe) id: number) {
        return this.centers.getById(id);
    }

    @ApiOperation({
        summary: 'Créer un centre de formation',
        description: 'Crée un nouveau centre de formation (endpoint réservé ADMIN).',
    })
    @ApiBody({
        type: CreateTrainingCenterDto,
        description: 'Données de création du centre.',
    })
    // @ApiStandardCreatedResponse({
    //     description: 'Centre de formation créé.',
    //     dataExample: {
    //         id: 17,
    //         name: 'Académie Numérique',
    //         city: 'Abidjan',
    //         is_active: true,
    //     },
    // })
    @Roles('ADMIN')
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Post()
    create(@Body() dto: CreateTrainingCenterDto) {
        return this.centers.create(dto);
    }

    @ApiOperation({
        summary: 'Mettre à jour un centre de formation',
        description: 'Mise à jour partielle d’un centre de formation (endpoint réservé ADMIN).',
    })
    @ApiParam({
        name: 'id',
        description: 'Identifiant numérique du centre.',
        example: 6,
    })
    @ApiBody({
        type: UpdateTrainingCenterDto,
        description: 'Données partielles de mise à jour du centre.',
    })
    // @ApiStandardOkResponse({
    //     description: 'Centre de formation mis à jour.',
    //     dataExample: {
    //         id: 6,
    //         name: 'Institut Supérieur Technique',
    //         is_active: true,
    //     },
    // })
    @Roles('ADMIN')
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTrainingCenterDto) {
        return this.centers.update(id, dto);
    }

    @ApiOperation({
        summary: 'Désactiver un centre de formation',
        description: 'Passe `is_active` à `false` pour le centre ciblé (endpoint réservé ADMIN).',
    })
    @ApiParam({
        name: 'id',
        description: 'Identifiant numérique du centre.',
        example: 6,
    })
    // @ApiStandardOkResponse({
    //     description: 'Centre de formation désactivé.',
    //     dataExample: {
    //         id: 6,
    //         is_active: false,
    //     },
    // })
    @Roles('ADMIN')
    @Throttle({ default: { limit: 10, ttl: 60 } })
    @Delete(':id')
    deactivate(@Param('id', ParseIntPipe) id: number) {
        return this.centers.deactivate(id);
    }
}
