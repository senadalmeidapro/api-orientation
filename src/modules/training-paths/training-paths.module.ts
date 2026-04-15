import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TrainingPathsController } from './training-paths.controller';
import { TrainingPathsService } from './training-paths.service';

@Module({
    imports: [PrismaModule],
    controllers: [TrainingPathsController],
    providers: [TrainingPathsService],
    exports: [TrainingPathsService],
})
export class TrainingPathsModule {}
