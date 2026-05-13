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
import { CareersService } from './careers.service';
import { publicDecorator } from '@common/decorators/public.decorator';
import { roles } from '@common/decorators/roles.decorator';
import { CreateCareerDto, ListCareersDto, UpdateCareerDto } from './dto';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
// import {
//     ApiStandardCreatedResponse,
//     ApiStandardErrorResponses,
//     ApiStandardOkResponse,
// } from '@common/swagger';

@ApiTags('Careers')
@ApiBearerAuth('access-token')
@Controller('api/v1/careers')
export class CareersController {
  constructor(private readonly careers: CareersService) {}

  @ApiOperation({
    summary: 'Lister les carrières',
    description:
      'Endpoint public de consultation du catalogue de carrières avec filtres de recherche, pagination et catégorie.',
  })
  // @ApiStandardOkResponse({
  //     description: 'Liste des carrières récupérée.',
  //     dataExample: [
  //         {
  //             id: 12,
  //             name: 'Ingénieur logiciel',
  //             category: 'TECH',
  //             riasec_codes: ['R', 'I', 'C'],
  //             is_active: true,
  //         },
  //     ],
  // })
  // @ApiStandardErrorResponses()
  @publicDecorator()
  @Throttle({ default: { limit: 120, ttl: 60 } })
  @Get()
  list(@Query() dto: ListCareersDto) {
    return this.careers.list(dto);
  }

  @ApiOperation({
    summary: 'Récupérer une carrière par ID',
    description: 'Endpoint public de détail carrière.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant numérique de la carrière.',
    example: 12,
  })
  // @ApiStandardOkResponse({
  //     description: 'Détail carrière récupéré.',
  //     dataExample: {
  //         id: 12,
  //         name: 'Ingénieur logiciel',
  //         summary: 'Conçoit et développe des applications.',
  //         institutions: [],
  //         resources: [],
  //         trainingPaths: [],
  //     },
  // })
  // @ApiStandardErrorResponses({ includeNotFound: true })
  @publicDecorator()
  @Throttle({ default: { limit: 120, ttl: 60 } })
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.careers.getById(id);
  }

  @ApiOperation({
    summary: 'Créer une carrière',
    description: 'Création d’une carrière (endpoint réservé ADMIN).',
  })
  @ApiBody({
    type: CreateCareerDto,
    description: 'Données de création carrière.',
  })
  // @ApiStandardCreatedResponse({
  //     description: 'Carrière créée.',
  //     dataExample: {
  //         id: 45,
  //         name: 'Data Analyst',
  //         category: 'DATA',
  //     },
  // })
  // @ApiStandardErrorResponses({ includeUnauthorized: true })
  @roles('ADMIN')
  @Throttle({ default: { limit: 30, ttl: 60 } })
  @Post()
  create(@Body() dto: CreateCareerDto) {
    return this.careers.create(dto);
  }

  @ApiOperation({
    summary: 'Mettre à jour une carrière',
    description: 'Mise à jour partielle d’une carrière (endpoint réservé ADMIN).',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant numérique de la carrière.',
    example: 12,
  })
  @ApiBody({
    type: UpdateCareerDto,
    description: 'Données partielles de mise à jour.',
  })
  // @ApiStandardOkResponse({
  //     description: 'Carrière mise à jour.',
  //     dataExample: {
  //         id: 12,
  //         name: 'Ingénieur logiciel',
  //         is_active: true,
  //     },
  // })
  // @ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
  @roles('ADMIN')
  @Throttle({ default: { limit: 30, ttl: 60 } })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCareerDto) {
    return this.careers.update(id, dto);
  }

  @ApiOperation({
    summary: 'Désactiver une carrière',
    description: 'Passe `is_active` à `false` pour la carrière ciblée (endpoint réservé ADMIN).',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant numérique de la carrière.',
    example: 12,
  })
  // @ApiStandardOkResponse({
  //     description: 'Carrière désactivée.',
  //     dataExample: {
  //         id: 12,
  //         is_active: false,
  //     },
  // })
  // @ApiStandardErrorResponses({ includeUnauthorized: true, includeNotFound: true })
  @roles('ADMIN')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Delete(':id')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.careers.deactivate(id);
  }
}
