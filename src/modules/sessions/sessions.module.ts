import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { SessionLifecycleService } from './services/session-lifecycle.service';
import { AssessmentFlowService } from './services/assessment-flow.service';

@Module({
    controllers: [SessionsController],
    providers: [SessionsService, SessionLifecycleService, AssessmentFlowService],
    exports: [SessionsService, SessionLifecycleService, AssessmentFlowService],
})
export class SessionsModule {}
