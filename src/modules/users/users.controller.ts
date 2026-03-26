import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateRolesDto } from './dto/update-roles.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly service: UsersService) {
    }

    @Get('me')
    me(@CurrentUser() user: any) {
        return this.service.getMe(user.id);
    }

    @Patch('me')
    updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
        return this.service.updateProfile(user.id, dto);
    }

    @Patch('settings')
    updateSettings(@CurrentUser() user: any, @Body() dto: UpdateSettingsDto) {
        return this.service.updateSettings(user.id, dto);
    }

    @Roles('admin')
    @Get()
    list(@Query() query: ListUsersDto) {
        return this.service.listUsers(query);
    }

    @Roles('admin')
    @Patch(':id/roles')
    async updateRoles(
        @Param('id') id: string,
        @Body() dto: UpdateRolesDto,
        @CurrentUser() user: any,
    ) {
        return this.service.updateRoles(id, dto);
    }

    @Get('health')
    health() {
        return this.service.health();
    }
}
