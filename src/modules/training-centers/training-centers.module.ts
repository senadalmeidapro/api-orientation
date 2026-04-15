import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TrainingCentersController } from './training-centers.controller';
import { TrainingCentersService } from './training-centers.service';

@Module({
    imports: [PrismaModule],
    controllers: [TrainingCentersController],
    providers: [TrainingCentersService],
    exports: [TrainingCentersService],
})
export class TrainingCentersModule {}
