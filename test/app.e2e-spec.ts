import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('E2E', () => {
    let app: INestApplication;

    beforeAll(async () => {
        await prisma.phase1Response.deleteMany();
        await prisma.phase2Response.deleteMany();
        await prisma.phase1Question.deleteMany();
        await prisma.phase2Question.deleteMany();
        await prisma.testVersion.deleteMany();
        await prisma.userBadge.deleteMany();
        await prisma.userResult.deleteMany();
        await prisma.userTestSession.deleteMany();
        await prisma.adminAuditLog.deleteMany();
        await prisma.user.deleteMany();

        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();

        const version = await prisma.testVersion.create({
            data: {
                code: 'test',
                name: 'Test Version',
                description: 'E2E',
                isActive: true,
            },
        });

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

        await prisma.phase2Question.createMany({
            data: [
                {
                    testVersionId: version.id,
                    riasecTypeId: 'R',
                    sectionType: 'OCCUPATIONS',
                    questionText: 'Occ Q1',
                    displayOrder: 1,
                    isActive: true,
                },
                {
                    testVersionId: version.id,
                    riasecTypeId: 'I',
                    sectionType: 'APTITUDES',
                    questionText: 'Apt Q1',
                    displayOrder: 1,
                    isActive: true,
                    minValue: 1,
                    maxValue: 3,
                },
                {
                    testVersionId: version.id,
                    riasecTypeId: 'R',
                    sectionType: 'PERSONALITY',
                    questionText: 'Pers Q1',
                    displayOrder: 1,
                    isActive: true,
                },
            ],
        });

        const passwordHash = await bcrypt.hash('adminpass', 10);
        await prisma.user.create({
            data: {
                email: 'admin@test.local',
                password: passwordHash,
                isAdmin: true,
                roles: [UserRole.ADMIN],
            },
        });
    });

    afterAll(async () => {
        await app.close();
        await prisma.$disconnect();
    });

    it('GET / should return health', async () => {
        await request(app.getHttpServer()).get('/').expect(200);
    });

    it('GET /questions/phase1 should return questions', async () => {
        const version = await prisma.testVersion.findFirst({ where: { code: 'test' } });
        const res = await request(app.getHttpServer())
            .get('/questions/phase1')
            .query({ testVersionId: version?.id })
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('Phase guard should block phase2 before phase1 completion', async () => {
        const sessionRes = await request(app.getHttpServer()).post('/sessions').send({});
        const sessionToken = sessionRes.body.sessionToken;

        const phase2Questions = await prisma.phase2Question.findMany();
        const res = await request(app.getHttpServer())
            .post('/responses/phase2')
            .send({
                sessionToken,
                responses: [{ questionId: phase2Questions[0].id, responseValue: 1 }],
            });

        expect(res.status).toBe(400);
    });

    it('Full flow should compute results, badges, and exports', async () => {
        const sessionRes = await request(app.getHttpServer()).post('/sessions').send({});
        const sessionToken = sessionRes.body.sessionToken;

        const phase1Questions = await prisma.phase1Question.findMany();
        await request(app.getHttpServer())
            .post('/responses/phase1')
            .send({
                sessionToken,
                responses: [{ questionId: phase1Questions[0].id, responseValue: 1 }],
            })
            .expect(201);

        const phase2Occ = await prisma.phase2Question.findFirst({
            where: { sectionType: 'OCCUPATIONS' },
        });
        const phase2Apt = await prisma.phase2Question.findFirst({
            where: { sectionType: 'APTITUDES' },
        });
        const phase2Pers = await prisma.phase2Question.findFirst({
            where: { sectionType: 'PERSONALITY' },
        });

        await request(app.getHttpServer())
            .post('/responses/phase2')
            .send({
                sessionToken,
                responses: [{ questionId: phase2Occ!.id, responseValue: 1 }],
            })
            .expect(201);

        await request(app.getHttpServer())
            .post('/responses/phase2')
            .send({
                sessionToken,
                responses: [{ questionId: phase2Apt!.id, responseValue: 2 }],
            })
            .expect(201);

        await request(app.getHttpServer())
            .post('/responses/phase2')
            .send({
                sessionToken,
                responses: [{ questionId: phase2Pers!.id, responseValue: 1 }],
            })
            .expect(201);

        await request(app.getHttpServer())
            .post('/results/compute')
            .send({ sessionToken })
            .expect(201);

        const badges = await prisma.userBadge.findMany();
        expect(badges.length).toBeGreaterThan(0);

        const login = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'admin@test.local', password: 'adminpass' })
            .expect(201);
        const token = login.body.access_token;

        await request(app.getHttpServer())
            .post('/contact')
            .send({
                name: 'Tester',
                email: 'tester@test.local',
                requestType: 'INFO',
                message: 'Hello',
            })
            .expect(201);

        await request(app.getHttpServer())
            .get('/contact/export')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    });
});
