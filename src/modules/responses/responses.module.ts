import { Module } from '@nestjs/common';
import { ResponsesController } from './responses.controller';
import { ResponsesService } from './responses.service';
import { BadgesModule } from '../badges/badges.module';

@Module({
    imports: [BadgesModule],
    controllers: [ResponsesController],
    providers: [ResponsesService],
    exports: [ResponsesService],
})
export class ResponsesModule {
}
