import { Injectable, Logger } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateSessionProfileDto } from './dto/update-session-profile.dto';
import { TestType } from '@prisma/client';
import { SessionLifecycleService } from './services/session-lifecycle.service';
import { AssessmentFlowService } from './services/assessment-flow.service';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    private readonly lifecycleService: SessionLifecycleService,
    private readonly flowService: AssessmentFlowService,
  ) {}

  async createSession(userId: string, dto: CreateSessionDto) {
    const session = await this.lifecycleService.createSession(userId);

    const testVersionId = await this.flowService.resolveTestVersionId(dto.testVersionId);

    const initialTestType = dto.initialTestType ?? TestType.GENERALE;
    const depth = dto.depth ?? 5; // DEFAULT_DEPTH

    const assessment = await this.flowService.createAssessment(session.id, testVersionId, {
      type: initialTestType,
      depth,
    });

    // Ensure user profile is updated immediately if passed (and if it's an authenticated session)
    if (dto.profile) {
      await this.lifecycleService.updateProfile(session.sessionToken, dto.profile);
    }

    return {
      sessionId: session.id,
      sessionToken: session.sessionToken,
      shareToken: session.shareToken,
      startedAt: session.createdAt,
      assessment,
    };
  }

  async getByToken(sessionToken: string) {
    return this.lifecycleService.getByToken(sessionToken);
  }

  async createAssessmentForSession(sessionToken: string, dto: CreateAssessmentDto) {
    return this.flowService.createAssessmentForSession(sessionToken, dto);
  }

  async listAssessments(sessionToken: string) {
    return this.flowService.listAssessments(sessionToken);
  }

  async updateProfile(sessionToken: string, dto: UpdateSessionProfileDto) {
    return this.lifecycleService.updateProfile(sessionToken, dto.profile);
  }
}
