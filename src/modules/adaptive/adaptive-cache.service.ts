import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';

type CacheEntry = {
    value: string;
    expiresAt?: number;
};

@Injectable()
export class AdaptiveCacheService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(AdaptiveCacheService.name);
    private client?: ReturnType<typeof createClient>;
    private memory = new Map<string, CacheEntry>();

    async onModuleInit() {
        const url = process.env.REDIS_URL;
        if (!url) return;

        const client = createClient({ url });
        client.on('error', (err) => {
            this.logger.error('Redis error', err instanceof Error ? err.stack : String(err));
        });

        try {
            await client.connect();
            this.client = client;
        } catch (err) {
            this.logger.error(
                'Redis connection failed, falling back to in-memory cache',
                err instanceof Error ? err.stack : String(err),
            );
        }
    }

    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
        }
    }

    async get<T>(key: string): Promise<T | null> {
        if (this.client) {
            const value = await this.client.get(key);
            return value ? (JSON.parse(value) as T) : null;
        }

        const entry = this.memory.get(key);
        if (!entry) return null;
        if (entry.expiresAt && entry.expiresAt <= Date.now()) {
            this.memory.delete(key);
            return null;
        }
        return JSON.parse(entry.value) as T;
    }

    async set<T>(key: string, value: T, ttlSeconds?: number) {
        const serialized = JSON.stringify(value);
        if (this.client) {
            if (ttlSeconds) {
                await this.client.set(key, serialized, { EX: ttlSeconds });
            } else {
                await this.client.set(key, serialized);
            }
            return;
        }

        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
        this.memory.set(key, { value: serialized, expiresAt });
    }

    async del(key: string) {
        if (this.client) {
            await this.client.del(key);
            return;
        }
        this.memory.delete(key);
    }
}
