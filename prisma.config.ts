import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
        seed: 'tsx src/common/seeders/seed.ts',
    },
    datasource: {
        url: env('DATABASE_URL'),
    },
    views: {
        path: 'prisma/views',
    },
});
