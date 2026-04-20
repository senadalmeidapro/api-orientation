import {
    Controller,
    Get,
    Logger,
    ServiceUnavailableException,
    HttpStatus,
    Res,
    Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import type { Cache } from 'cache-manager';
import * as os from 'os';
import * as process from 'process';
import { Public } from './common/decorators/public.decorator';
import { PrismaService } from './prisma/prisma.service';
import { ConfigService } from './common/config/config.service';

/* ─────────────────────────────────────────
 * TYPES
 * ───────────────────────────────────────── */

type ServiceStatus = 'ok' | 'degraded' | 'down';

interface CheckResult {
    status: ServiceStatus;
    latencyMs?: number;
    message?: string;
}

interface MemoryInfo {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
    externalMb: number;
    usagePercent: number;
}

interface SystemInfo {
    platform: string;
    arch: string;
    nodeVersion: string;
    cpuCount: number;
    totalMemoryMb: number;
    loadAvg: number[];
}

interface HealthResponse {
    status: ServiceStatus;
    service: string;
    version: string;
    environment: string;
    timestamp: string;
    uptimeSeconds: number;
    checks: {
        database: CheckResult;
        cache: CheckResult;
        memory: CheckResult & { details: MemoryInfo };
    };
    system: SystemInfo;
}

/* ─────────────────────────────────────────
 * CONSTANTES
 * ───────────────────────────────────────── */

const MEMORY_WARN_THRESHOLD = 0.8;
const MEMORY_CRIT_THRESHOLD = 0.95;
const DB_WARN_LATENCY_MS = 200;
const DB_CRIT_LATENCY_MS = 1000;
const CACHE_WARN_LATENCY_MS = 50;
const CACHE_CRIT_LATENCY_MS = 500;
const CACHE_PROBE_KEY = '__health_probe__';
const CACHE_PROBE_VALUE = 'ok';
const CACHE_PROBE_TTL_MS = 5_000;

/* ─────────────────────────────────────────
 * CONTROLLER
 * ───────────────────────────────────────── */

@ApiTags('Health')
@Public()
@Controller('api/v1/health')
export class HealthController {
    private readonly logger = new Logger(HealthController.name);
    private readonly startAt = Date.now();

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
        @Inject(CACHE_MANAGER) private readonly cache: Cache,
    ) {}

    /* ─────────────────────────────────────
     * GET /api/v1/health
     * ───────────────────────────────────── */

    @ApiOperation({
        summary: 'Health check complet',
        description:
            "Retourne l'état opérationnel de l'API : DB, cache, mémoire et métriques système.",
    })
    @Get()
    async health(@Res() res: Response): Promise<void> {
        const [dbCheck, cacheCheck, memCheck] = await Promise.all([
            this.checkDatabase(),
            this.checkCache(),
            Promise.resolve(this.checkMemory()),
        ]);

        const overallStatus = this.resolveOverallStatus([
            dbCheck.status,
            cacheCheck.status,
            memCheck.status,
        ]);

        const payload: HealthResponse = {
            status: overallStatus,
            service: this.config.app.name,
            version: this.config.app.version,
            environment: this.config.app.env,
            timestamp: new Date().toISOString(),
            uptimeSeconds: Math.floor((Date.now() - this.startAt) / 1000),
            checks: {
                database: dbCheck,
                cache: cacheCheck,
                memory: memCheck,
            },
            system: this.getSystemInfo(),
        };

        const httpStatus =
            overallStatus === 'down' ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.OK;

        if (overallStatus === 'down') {
            this.logger.error('Healthcheck FAILED', JSON.stringify(payload, null, 2));
        } else if (overallStatus === 'degraded') {
            this.logger.warn('Healthcheck DEGRADED', JSON.stringify(payload, null, 2));
        }

        res.status(httpStatus).json(payload);
    }

    /* ─────────────────────────────────────
     * GET /api/v1/health/live
     * ───────────────────────────────────── */

    @ApiOperation({
        summary: 'Liveness probe',
        description:
            'Railway / Kubernetes liveness probe. Répond 200 si le process Node est vivant.',
    })
    @Get('live')
    live(): { status: 'alive'; timestamp: string } {
        return { status: 'alive', timestamp: new Date().toISOString() };
    }

    /* ─────────────────────────────────────
     * GET /api/v1/health/ready
     * ───────────────────────────────────── */

    @ApiOperation({
        summary: 'Readiness probe',
        description: 'Railway / Kubernetes readiness probe. Répond 200 si la DB est joignable.',
    })
    @Get('ready')
    async ready(@Res() res: Response): Promise<void> {
        const db = await this.checkDatabase();

        if (db.status === 'down') {
            throw new ServiceUnavailableException({
                status: 'not_ready',
                reason: 'database_unavailable',
                message: db.message,
                timestamp: new Date().toISOString(),
            });
        }

        res.status(HttpStatus.OK).json({
            status: 'ready',
            timestamp: new Date().toISOString(),
        });
    }

    /* ─────────────────────────────────────
     * CHECKS
     * ───────────────────────────────────── */

    private async checkDatabase(): Promise<CheckResult> {
        const t0 = Date.now();
        try {
            await this.prisma.$queryRawUnsafe<unknown>('SELECT 1');
            const latencyMs = Date.now() - t0;

            if (latencyMs >= DB_CRIT_LATENCY_MS) {
                return {
                    status: 'degraded',
                    latencyMs,
                    message: `Latence critique : ${latencyMs}ms`,
                };
            }
            if (latencyMs >= DB_WARN_LATENCY_MS) {
                return {
                    status: 'degraded',
                    latencyMs,
                    message: `Latence élevée : ${latencyMs}ms`,
                };
            }
            return { status: 'ok', latencyMs };
        } catch (err: unknown) {
            this.logger.error(`DB check failed: ${this.extractMessage(err)}`);
            return { status: 'down', latencyMs: Date.now() - t0, message: 'Database unreachable' };
        }
    }

    private async checkCache(): Promise<CheckResult> {
        const t0 = Date.now();
        try {
            // SET
            await this.cache.set(CACHE_PROBE_KEY, CACHE_PROBE_VALUE, CACHE_PROBE_TTL_MS);

            // GET + vérification round-trip
            const value = await this.cache.get<string>(CACHE_PROBE_KEY);
            const latencyMs = Date.now() - t0;

            if (value !== CACHE_PROBE_VALUE) {
                return { status: 'degraded', latencyMs, message: 'Round-trip cache incohérent' };
            }
            if (latencyMs >= CACHE_CRIT_LATENCY_MS) {
                return {
                    status: 'degraded',
                    latencyMs,
                    message: `Latence critique : ${latencyMs}ms`,
                };
            }
            if (latencyMs >= CACHE_WARN_LATENCY_MS) {
                return {
                    status: 'degraded',
                    latencyMs,
                    message: `Latence élevée : ${latencyMs}ms`,
                };
            }
            return { status: 'ok', latencyMs };
        } catch (err: unknown) {
            this.logger.warn(`Cache check failed: ${this.extractMessage(err)}`);
            // Cache dégradé ≠ down (non bloquant)
            return { status: 'degraded', latencyMs: Date.now() - t0, message: 'Cache unreachable' };
        }
    }

    private checkMemory(): CheckResult & { details: MemoryInfo } {
        const mem = process.memoryUsage();
        const totalMem = os.totalmem();
        const usagePercent = mem.rss / totalMem;

        const details: MemoryInfo = {
            heapUsedMb: this.toMb(mem.heapUsed),
            heapTotalMb: this.toMb(mem.heapTotal),
            rssMb: this.toMb(mem.rss),
            externalMb: this.toMb(mem.external),
            usagePercent: Math.round(usagePercent * 1000) / 10,
        };

        if (usagePercent >= MEMORY_CRIT_THRESHOLD) {
            return {
                status: 'down',
                details,
                message: `Mémoire critique : ${details.usagePercent}%`,
            };
        }
        if (usagePercent >= MEMORY_WARN_THRESHOLD) {
            return {
                status: 'degraded',
                details,
                message: `Mémoire élevée : ${details.usagePercent}%`,
            };
        }
        return { status: 'ok', details };
    }

    /* ─────────────────────────────────────
     * HELPERS
     * ───────────────────────────────────── */

    private resolveOverallStatus(statuses: ServiceStatus[]): ServiceStatus {
        if (statuses.includes('down')) return 'down';
        if (statuses.includes('degraded')) return 'degraded';
        return 'ok';
    }

    private getSystemInfo(): SystemInfo {
        return {
            platform: os.platform(),
            arch: os.arch(),
            nodeVersion: process.version,
            cpuCount: os.cpus().length,
            totalMemoryMb: this.toMb(os.totalmem()),
            loadAvg: os.loadavg().map((v) => Math.round(v * 100) / 100),
        };
    }

    private toMb(bytes: number): number {
        return Math.round((bytes / 1024 / 1024) * 10) / 10;
    }

    private extractMessage(err: unknown): string {
        return err instanceof Error ? err.message : String(err);
    }
}
