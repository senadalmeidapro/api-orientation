import 'dotenv/config';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});
const testRunId = Date.now().toString(36);
const testVersionCode = `e2e-${testRunId}`;
const adminEmail = `admin+${testRunId}@test.local`;
const adminPassword = 'adminpass123';

describe('E2E', () => {
  let app: INestApplication;
  let accessToken = '';
  let testVersionId = 0;
  let phase2QuestionId = 0;
  const createdSessionIds: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const version = await prisma.testVersion.create({
      data: {
        code: testVersionCode,
        name: 'Test Version',
        description: 'E2E',
        isActive: true,
      },
    });
    testVersionId = version.id;

    await prisma.riasecTypeModel.upsert({
      where: { id: 'R' },
      update: { name: 'Réaliste' },
      create: { id: 'R', name: 'Réaliste' },
    });
    await prisma.riasecTypeModel.upsert({
      where: { id: 'I' },
      update: { name: 'Investigateur' },
      create: { id: 'I', name: 'Investigateur' },
    });

    await prisma.phase1Question.create({
      data: {
        testVersionId: version.id,
        riasecTypeId: 'R',
        questionText: 'Test question',
        displayOrder: 1,
        isActive: true,
      },
    });

    const phase2Question = await prisma.phase2Question.create({
      data: {
        testVersionId: version.id,
        riasecTypeId: 'R',
        phase2Type: 'OCCUPATIONS',
        questionText: 'Occ Q1',
        displayOrder: 1,
        isActive: true,
      },
    });
    phase2QuestionId = phase2Question.id;

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: passwordHash,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
    });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(201);

    accessToken = login.body.accessToken;
    expect(typeof accessToken).toBe('string');
  });

  afterAll(async () => {
    if (testVersionId) {
      await prisma.assessment.deleteMany({
        where: { testVersionId },
      });
      await prisma.phase1Question.deleteMany({
        where: { testVersionId },
      });
      await prisma.phase2Question.deleteMany({
        where: { testVersionId },
      });
      await prisma.testVersion.deleteMany({
        where: { id: testVersionId },
      });
    }

    if (createdSessionIds.length > 0) {
      await prisma.session.deleteMany({
        where: { id: { in: createdSessionIds } },
      });
    }

    await prisma.user.deleteMany({
      where: { email: adminEmail },
    });

    if (app) {
      await app.close();
    }
    await prisma.$disconnect();
  });

  it('GET /health should return health payload', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /sessions should require authentication', async () => {
    await request(app.getHttpServer()).post('/sessions').send({}).expect(401);
  });

  it('GET /questions/phase1 should return questions for authenticated user session', async () => {
    const sessionRes = await request(app.getHttpServer())
      .post('/sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ testVersionId: testVersionId })
      .expect(201);
    const sessionToken = sessionRes.body.sessionToken as string;
    createdSessionIds.push(sessionRes.body.sessionId);

    const res = await request(app.getHttpServer())
      .get('/questions/phase1')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ sessionToken })
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].riasecType).toBe('R');
  });

  it('Phase guard should block phase2 responses before phase1 completion', async () => {
    const sessionRes = await request(app.getHttpServer())
      .post('/sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ testVersionId: testVersionId })
      .expect(201);
    const sessionToken = sessionRes.body.sessionToken as string;
    createdSessionIds.push(sessionRes.body.sessionId);

    const res = await request(app.getHttpServer())
      .post('/responses/phase2')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sessionToken,
        responses: [{ questionId: phase2QuestionId, responseValue: 1 }],
      });

    expect(res.status).toBe(404);
  });
});
