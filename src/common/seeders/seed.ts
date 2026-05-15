/* eslint-disable no-console */
import 'dotenv/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '../config/config.service';
import { seedAssessmentQuestionData } from './assessment/AssessmentQuestionSeeder';
import { seedQuestionProfiles } from './assessment/QuestionProfileSeeder';
import { seedEnhancedCareers } from './careers/CareerSeeder';
import { seedEnhancedBadges } from './gamification/BadgeSeeder';
import { seedSampleAssessmentData } from './sample_data/SampleAssessmentSeeder';

const config = new ConfigService();
const prisma = new PrismaService(config);

async function main() {
  await seedAssessmentQuestionData(prisma);
  await seedEnhancedCareers(prisma);
  await seedEnhancedBadges(prisma);
  await seedSampleAssessmentData(prisma);
  await seedQuestionProfiles(prisma);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
