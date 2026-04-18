import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PrismaService } from '../../prisma/prisma.service';

type LinkSeedFile = {
    categories: LinkCategorySeed[];
};

type LinkCategorySeed = {
    name: string;
    links: LinkSeedItem[];
};

type LinkSeedItem = {
    title: string;
    url: string | null;
    note?: string | null;
};

export async function seedLinkCategories(prisma: PrismaService) {
    const filePath = path.resolve(__dirname, '..', '..', 'link-categories.json');
    const raw = await readFile(filePath, 'utf-8');
    const data = JSON.parse(raw) as LinkSeedFile;

    if (!Array.isArray(data.categories)) {
        throw new Error('Invalid link categories JSON: "categories" must be an array.');
    }

    for (const category of data.categories) {
        if (!category?.name || !Array.isArray(category.links)) {
            throw new Error('Invalid link category entry: missing name or links.');
        }

        const savedCategory = await prisma.linkCategory.upsert({
            where: { name: category.name },
            update: {},
            create: { name: category.name },
        });

        for (const link of category.links) {
            if (!link?.title) {
                throw new Error(
                    `Invalid link entry in category "${category.name}": missing title.`,
                );
            }

            await prisma.link.upsert({
                where: {
                    category_id_title: {
                        category_id: savedCategory.id,
                        title: link.title,
                    },
                },
                update: {
                    url: link.url ?? null,
                    note: link.note ?? null,
                },
                create: {
                    category_id: savedCategory.id,
                    title: link.title,
                    url: link.url ?? null,
                    note: link.note ?? null,
                },
            });
        }
    }
}
