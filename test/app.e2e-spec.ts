import 'dotenv/config';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
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
const TEST_RUN_ID = Date.now().toString(36);
const TEST_VERSION_CODE = `e2e-${TEST_RUN_ID}`;
const ADMIN_EMAIL = `admin+${TEST_RUN_ID}@test.local`;
const ADMIN_PASSWORD = 'adminpass123';

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
                code: TEST_VERSION_CODE,
                name: 'Test Version',
                description: 'E2E',
                is_active: true,
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
                test_version_id: version.id,
                riasec_type_id: 'R',
                question_text: 'Test question',
                display_order: 1,
                is_active: true,
            },
        });

        const phase2Question = await prisma.phase2Question.create({
            data: {
                test_version_id: version.id,
                riasec_type_id: 'R',
                phase2_type: 'OCCUPATIONS',
                question_text: 'Occ Q1',
                display_order: 1,
                is_active: true,
            },
        });
        phase2QuestionId = phase2Question.id;

        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await prisma.user.create({
            data: {
                email: ADMIN_EMAIL,
                password: passwordHash,
                role: UserRole.ADMIN,
                status: UserStatus.ACTIVE,
                email_verified_at: new Date(),
            },
        });

        const login = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
            .expect(201);

        accessToken = login.body.accessToken;
        expect(typeof accessToken).toBe('string');
    });

    afterAll(async () => {
        if (testVersionId) {
            await prisma.assessment.deleteMany({
                where: { test_version_id: testVersionId },
            });
            await prisma.phase1Question.deleteMany({
                where: { test_version_id: testVersionId },
            });
            await prisma.phase2Question.deleteMany({
                where: { test_version_id: testVersionId },
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
            where: { email: ADMIN_EMAIL },
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
