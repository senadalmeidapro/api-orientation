import { Controller, Get, Param } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('badges')
export class BadgesController {
    constructor(private readonly service: BadgesService) {
    }

    @Public()
    @Get()
    list() {
        return this.service.listBadges();
    }

    @Get('me')
    getMine(@CurrentUser() user: any) {
        return this.service.getUserBadges(user.id);
    }

    @Get('me/level')
    getMyLevel(@CurrentUser() user: any) {
        return this.service.getUserLevel(user.id);
    }

    @Roles('admin')
    @Get('user/:userId')
    getByUser(@Param('userId') userId: string) {
        return this.service.getUserBadges(userId);
    }

    @Get('health')
    health() {
        return this.service.health();
    }
}
