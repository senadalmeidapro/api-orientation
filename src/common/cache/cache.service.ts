import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

    async get<T>(key: string): Promise<T | null> {
        const value = await this.cacheManager.get<T>(key);
        return (value ?? null) as T | null;
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds === undefined) {
            await this.cacheManager.set(key, value);
            return;
        }

        const ttlMs = Math.max(0, Math.floor(ttlSeconds * 1000));
        await this.cacheManager.set(key, value, ttlMs);
    }

    async delete(key: string): Promise<void> {
        await this.cacheManager.del(key);
    }

    async reset(): Promise<void> {
        await this.cacheManager.clear();
    }
}
