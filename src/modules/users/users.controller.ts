import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserRole, UserStatus } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateUserDto, UpdateUserRolesDto, UserResponseDto } from './dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly users: UsersService) {}

    @Throttle({ default: { limit: 30, ttl: 60 } })
    @Get('me')
    async me(@CurrentUser('id') id: string): Promise<UserResponseDto> {
        return this.users.findById(id);
    }

    @Throttle({ default: { limit: 20, ttl: 60 } })
    @Roles(UserRole.ADMIN)
    @Get()
    list(): Promise<UserResponseDto[]> {
        return this.users.listUsers();
    }

    @Throttle({ default: { limit: 20, ttl: 60 } })
    @Roles(UserRole.ADMIN)
    @Get(':userId')
    getById(@Param('userId') userId: string): Promise<UserResponseDto> {
        return this.users.findById(userId);
    }

    @Throttle({ default: { limit: 20, ttl: 60 } })
    @Roles(UserRole.ADMIN)
    @Patch(':userId')
    update(@Param('userId') userId: string, @Body() dto: UpdateUserDto): Promise<UserResponseDto> {
        return this.users.updateUser(userId, dto);
    }

    @Throttle({ default: { limit: 20, ttl: 60 } })
    @Roles(UserRole.ADMIN)
    @Patch(':userId/roles')
    updateRoles(
        @Param('userId') userId: string,
        @Body() dto: UpdateUserRolesDto,
    ): Promise<UserResponseDto> {
        return this.users.setUserRoles(userId, dto.roles);
    }
}
