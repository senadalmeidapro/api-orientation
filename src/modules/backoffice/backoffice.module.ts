import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { BackofficeController } from './backoffice.controller';
import { BackofficeService } from './backoffice.service';
import { UsersModule } from '@modules/users/users.module';
import { CareersModule } from '@modules/careers/careers.module';
import { ResourcesModule } from '@modules/resources/resources.module';
import { UniversitiesModule } from '@modules/universities/universities.module';

@Module({
  imports: [PrismaModule, UsersModule, CareersModule, ResourcesModule, UniversitiesModule],
  controllers: [BackofficeController],
  providers: [BackofficeService],
})
export class BackofficeModule {}
