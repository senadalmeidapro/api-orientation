# Copilot instructions for `api-orientation`

## Build, lint, and test commands

Use these project-native commands:

```bash
# Install deps
npm install

# Prisma setup required before tests/build in fresh environments
npx prisma generate
npx prisma db push

# Lint (auto-fixes code)
npm run lint

# Build
npm run build

# Unit tests
npm run test

# Single unit test file
npm run test -- src/modules/questions/questions.service.spec.ts

# Single unit test by name
npm run test -- --testNamePattern="phase1"

# E2E tests
npm run test:e2e

# Single E2E test file
npm run test:e2e -- test/app.e2e-spec.ts

# CI-style deterministic runs
npm run test -- --runInBand
npm run test:e2e -- --runInBand
```

Notes:
- Unit and e2e tests expect PostgreSQL (and in CI, Redis is also available).
- CI runs: `lint` -> `unit-tests` -> `e2e-tests` -> `build` (see `.github/workflows/ci.yml`).

## High-level architecture

- **Framework shape:** NestJS modular monolith. `AppModule` wires feature modules (`sessions`, `questions`, `responses`, `results`, `recommendations`, `ai`, etc.) plus shared infrastructure (`PrismaModule`, cache, config, email).
- **Request pipeline:** global throttling + JWT + roles guards, global `ValidationPipe`, global success interceptor, and global exception filter.
- **API versioning:** public routes are controller-prefixed with `/api/v1/...` (see `docs/api-versioning.md`).
- **Core RIASEC flow:** session creation -> question retrieval (phase1/phase2 or adaptive batch) -> response submission -> scoring/results -> career recommendations -> optional AI summary/coach.
- **Adaptive flow (cross-module):**
  - `QuestionsService.getNextBatchQuestions()` uses `AdaptiveSelectionService` + `BatchManagementService`.
  - `ResponsesService.submitBatchResponses()` persists behavioral metadata, records indicators, completes batch, and recomputes intermediate profile.
  - `ResultsService`/`EnhancedResultsService` combine RIASEC outputs with behavioral and AI enrichment.
- **Data layer:** Prisma + PostgreSQL via `@prisma/adapter-pg` (`PrismaService`). Schema uses snake_case DB fields; API DTOs usually expose camelCase.

## Key repository conventions

- **Auth is default-deny:** JWT guard is registered globally (`APP_GUARD`). Mark explicitly public endpoints with `@Public()`.
- **Response contract is standardized:**
  - Successes are wrapped as `{ success, statusCode, message, data }` by `ApiSuccessResponseInterceptor`.
  - Errors are normalized by `ApiExceptionFilter` with `{ success: false, statusCode, message, error, details, path, timestamp }`.
- **Swagger docs convention:** controllers typically use `ApiStandardOkResponse`, `ApiStandardCreatedResponse`, and `ApiStandardErrorResponses` helpers from `src/common/swagger`.
- **Session/assessment resolution convention:** reuse `resolveSessionAndAssessment(...)` for token lookup, active assessment selection, and phase/section guard checks instead of reimplementing this logic.
- **Sessions module split is intentional:**
  - `SessionsService` = orchestration/facade
  - `SessionLifecycleService` = token/session lifecycle + profile propagation
  - `AssessmentFlowService` = assessment creation, version resolution, and phase constraints
- **Adaptive payload convention:** batch response DTOs should carry `timeTakenMs`, `changeCount`, and optional `metadata`; behavioral analysis relies on those fields.
- **AI module conventions:** keep prompts/responses in French, send minimal context, avoid unnecessary personal data, and prefer structured JSON outputs (via `AiClient` JSON schema path).
- **Caching convention for questions:** use cache keys shaped like `questions:phase1:*` / `questions:phase2:*` with ~300s TTL in `QuestionsService`.
