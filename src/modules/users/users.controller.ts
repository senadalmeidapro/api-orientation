import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { roles } from '@common/decorators/roles.decorator';
import { UpdateUserDto, UpdateUserRolesDto, UserResponseDto } from './dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { currentUser } from '@common/decorators';
import {
    ApiBearerAuth,
    ApiBody,
    ApiNotFoundResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '@common/dto/api-response.dto';
// import { ApiStandardErrorResponses, ApiStandardOkResponse } from '@common/swagger';

@ApiTags('Users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
// @ApiStandardErrorResponses({ includeUnauthorized: true })
@Controller('api/v1/users')
export class UsersController {
    constructor(private readonly users: UsersService) {}

    @ApiOperation({
        summary: 'Récupérer le profil utilisateur courant',
        description:
            'Retourne les informations du compte associé au token JWT courant. Aucun paramètre de route, query ou body.',
    })
    // @ApiStandardOkResponse({
    //     description: 'Profil utilisateur courant récupéré.',
    //     model: UserResponseDto,
    //     message: 'Profil utilisateur récupéré.',
    // })
    @ApiNotFoundResponse({
        description: 'Utilisateur introuvable.',
        type: ApiErrorResponseDto,
        schema: {
            example: {
                success: false,
                statusCode: 404,
                message: 'Utilisateur introuvable',
                error: 'Not Found',
                path: '/users/me',
                timestamp: '2026-04-15T07:37:14.360Z',
            },
        },
    })
    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Get('me')
    async me(@currentUser('id') id: string): Promise<UserResponseDto> {
        return this.users.findById(id);
    }

    @ApiOperation({
        summary: 'Lister les utilisateurs',
        description: 'Retourne la liste des utilisateurs visibles. Endpoint réservé au rôle ADMIN.',
    })
    // @ApiStandardOkResponse({
    //     description: 'Liste des utilisateurs récupérée.',
    //     model: UserResponseDto,
    //     isArray: true,
    //     message: 'Liste des utilisateurs récupérée.',
    // })
    @Throttle({ default: { limit: 20, ttl: 60 } })
    @roles(UserRole.ADMIN)
    @Get()
    list(): Promise<UserResponseDto[]> {
        return this.users.listUsers();
    }

    @ApiOperation({
        summary: 'Récupérer un utilisateur par identifiant',
        description:
            'Lit un utilisateur précis à partir du paramètre de route `userId`. Endpoint réservé au rôle ADMIN.',
    })
    @ApiParam({
        name: 'userId',
        description: 'Identifiant unique de l’utilisateur.',
        example: 'clx123abc0001',
    })
    // @ApiStandardOkResponse({
    //     description: 'Utilisateur récupéré.',
    //     model: UserResponseDto,
    //     message: 'Utilisateur récupéré.',
    // })
    @ApiNotFoundResponse({
        description: 'Utilisateur introuvable.',
        type: ApiErrorResponseDto,
        schema: {
            example: {
                success: false,
                statusCode: 404,
                message: 'Utilisateur introuvable',
                error: 'Not Found',
                path: '/users/clx123abc0001',
                timestamp: '2026-04-15T07:37:14.360Z',
            },
        },
    })
    @Throttle({ default: { limit: 20, ttl: 60 } })
    @roles(UserRole.ADMIN)
    @Get(':userId')
    getById(@Param('userId') userId: string): Promise<UserResponseDto> {
        return this.users.findById(userId);
    }

    @ApiOperation({
        summary: 'Mettre à jour un utilisateur',
        description:
            'Met à jour les champs autorisés du profil utilisateur ciblé (`displayName`, `bio`, `status`). Endpoint réservé ADMIN.',
    })
    @ApiParam({
        name: 'userId',
        description: 'Identifiant unique de l’utilisateur à modifier.',
        example: 'clx123abc0001',
    })
    @ApiBody({
        type: UpdateUserDto,
        description: 'Données partielles de mise à jour de l’utilisateur.',
    })
    // @ApiStandardOkResponse({
    //     description: 'Utilisateur mis à jour.',
    //     model: UserResponseDto,
    //     message: 'Utilisateur mis à jour.',
    // })
    @ApiNotFoundResponse({
        description: 'Utilisateur introuvable.',
        type: ApiErrorResponseDto,
        schema: {
            example: {
                success: false,
                statusCode: 404,
                message: 'Utilisateur introuvable',
                error: 'Not Found',
                path: '/users/clx123abc0001',
                timestamp: '2026-04-15T07:37:14.360Z',
            },
        },
    })
    @Throttle({ default: { limit: 20, ttl: 60 } })
    @roles(UserRole.ADMIN)
    @Patch(':userId')
    update(@Param('userId') userId: string, @Body() dto: UpdateUserDto): Promise<UserResponseDto> {
        return this.users.updateUser(userId, dto);
    }

    @ApiOperation({
        summary: 'Mettre à jour les rôles utilisateur',
        description:
            'Met à jour les rôles de l’utilisateur cible. La contrainte métier impose un seul rôle effectif. Endpoint réservé ADMIN.',
    })
    @ApiParam({
        name: 'userId',
        description: 'Identifiant unique de l’utilisateur à mettre à jour.',
        example: 'clx123abc0001',
    })
    @ApiBody({
        type: UpdateUserRolesDto,
        description: 'Liste de rôles à affecter (un seul rôle autorisé).',
    })
    // @ApiStandardOkResponse({
    //     description: 'Rôles utilisateur mis à jour.',
    //     model: UserResponseDto,
    //     message: 'Rôles utilisateur mis à jour.',
    // })
    @ApiNotFoundResponse({
        description: 'Utilisateur introuvable.',
        type: ApiErrorResponseDto,
        schema: {
            example: {
                success: false,
                statusCode: 404,
                message: 'Utilisateur introuvable',
                error: 'Not Found',
                path: '/users/clx123abc0001/roles',
                timestamp: '2026-04-15T07:37:14.360Z',
            },
        },
    })
    @Throttle({ default: { limit: 20, ttl: 60 } })
    @roles(UserRole.ADMIN)
    @Patch(':userId/roles')
    updateRoles(
        @Param('userId') userId: string,
        @Body() dto: UpdateUserRolesDto,
    ): Promise<UserResponseDto> {
        return this.users.setUserRoles(userId, dto.roles);
    }
}
