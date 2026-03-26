# Copilot instructions

## Build, test, lint

- Lint: `npm run lint`
- Unit tests: `npm run test`
- Single unit test: `npm run test -- src/modules/users/users.service.spec.ts`
- E2E tests: `npm run test:e2e`
- Single E2E test: `npm run test:e2e -- test/app.e2e-spec.ts`
- Build: `npm run build`
- Seed DB: `npm run seed`

E2E tests require a Postgres database. CI uses `DATABASE_URL`, runs `npx prisma generate`, then `npx prisma db push`.

## High-level architecture

- NestJS app with `AppModule` wiring all modules and registering global guards/interceptor.
- Infra:
    - `src/prisma/` provides `PrismaModule`/`PrismaService` for all DB access.
    - `src/common/` holds cross-cutting concerns (guards, decorators, audit, logger, mail, utils).
    - `src/metrics/` exposes Prometheus metrics and a global `MetricsInterceptor`.
- Feature modules live under `src/modules/`:
    - Test flow: `sessions`, `questions`, `responses`, `scoring`, `results` (treasure-map PDF).
    - Content & catalog: `resources`, `institutions`, `announcements`, `careers`, `recommendations`.
    - User/admin: `auth`, `users`, `admin`, `badges`, `localization`, `analytics`, `contact`, `media`.
- Bootstrap in `src/main.ts` sets CORS, Helmet, global `ValidationPipe`, Sentry, and Swagger via
  `src/fastify-swagger.ts`.

## Key conventions

- Public routes use `@Public()`; RBAC uses `@Roles()` with `RolesGuard`.
- Global guards in `AppModule`: `JwtAuthGuard`, `RolesGuard`, `ThrottlerBehindProxyGuard`.
- DTOs live in each module’s `dto/` directory and are required for validation.
- Use `PrismaService` for all DB access; avoid raw DB clients.
- Metrics endpoint `/metrics` supports token via `X-Metrics-Token` or `Authorization: Bearer`.
- Treasure-map PDFs are stored under `storage/treasure-maps` when S3 is not configured.
