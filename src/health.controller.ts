import {
    Controller,
    Get,
    Logger,
    ServiceUnavailableException,
    HttpCode,
    HttpStatus,
    Res,
    Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import type { Cache } from 'cache-manager';
import * as os from 'os';
import * as process from 'process';
import { publicDecorator } from './common/decorators/public.decorator';
import { PrismaService } from './prisma/prisma.service';
import { ConfigService } from './common/config/config.service';

/* ─────────────────────────────────────────
 * TYPES — réponses
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

interface LiveResponse {
    status: 'alive';
    timestamp: string;
}

interface ReadyResponse {
    status: 'ready';
    timestamp: string;
}

/* ─────────────────────────────────────────
 * TYPES — erreurs
 * ───────────────────────────────────────── */

interface NotReadyError {
    status: 'not_ready';
    reason: 'database_unavailable';
    message: string | undefined;
    timestamp: string;
}

/* ─────────────────────────────────────────
 * CONSTANTES
 * ───────────────────────────────────────── */

const memoryWarnThreshold = 0.8;
const memoryCritThreshold = 0.95;
const dbWarnLatencyMs = 200;
const dbCritLatencyMs = 1_000;
const cacheWarnLatencyMs = 50;
const cacheCritLatencyMs = 500;
const cacheProbeKey = '__health_probe__';
const cacheProbeValue = 'ok';
const cacheProbeTtlMs = 5_000;

/* ─────────────────────────────────────────
 * CONTROLLER
 * ───────────────────────────────────────── */

@ApiTags('Health')
@publicDecorator()
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
     * Status 200 → ok | degraded
     * Status 503 → down
     * ───────────────────────────────────── */

    @ApiOperation({
        summary: 'Health check complet',
        description: "État opérationnel de l'API : DB, cache, mémoire et métriques système.",
    })
    @ApiResponse({ status: 200, description: 'Service opérationnel ou dégradé.' })
    @ApiResponse({ status: 503, description: 'Service indisponible.' })
    @Get()
    async health(@Res({ passthrough: true }) res: Response): Promise<HealthResponse> {
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

        if (overallStatus === 'down') {
            this.logger.error('Healthcheck FAILED', JSON.stringify(payload, null, 2));
            res.status(HttpStatus.SERVICE_UNAVAILABLE);
        } else if (overallStatus === 'degraded') {
            this.logger.warn('Healthcheck DEGRADED', JSON.stringify(payload, null, 2));
        }

        return payload;
    }

    /* ─────────────────────────────────────
     * GET /api/v1/health/live
     * Status 200 → process Node vivant
     * ───────────────────────────────────── */

    @ApiOperation({
        summary: 'Liveness probe',
        description: 'Railway / Kubernetes liveness probe. 200 si le process Node est vivant.',
    })
    @ApiResponse({ status: 200, description: 'Process vivant.' })
    @HttpCode(HttpStatus.OK)
    @Get('live')
    live(): LiveResponse {
        return { status: 'alive', timestamp: new Date().toISOString() };
    }

    /* ─────────────────────────────────────
     * GET /api/v1/health/ready
     * Status 200 → DB joignable
     * Status 503 → DB injoignable (NotReadyError)
     * ───────────────────────────────────── */

    @ApiOperation({
        summary: 'Readiness probe',
        description: 'Railway / Kubernetes readiness probe. 200 si la DB est joignable.',
    })
    @ApiResponse({ status: 200, description: 'Service prêt.' })
    @ApiResponse({ status: 503, description: 'Base de données injoignable.' })
    @HttpCode(HttpStatus.OK)
    @Get('ready')
    async ready(): Promise<ReadyResponse> {
        const db = await this.checkDatabase();

        this.logger.log(`Ready check → status: ${db.status}, message: ${db.message ?? 'none'}`);

        if (db.status === 'down') {
            const error: NotReadyError = {
                status: 'not_ready',
                reason: 'database_unavailable',
                message: db.message,
                timestamp: new Date().toISOString(),
            };
            throw new ServiceUnavailableException(error);
        }

        return { status: 'ready', timestamp: new Date().toISOString() };
    }

    /* ─────────────────────────────────────
     * CHECKS
     * ───────────────────────────────────── */

    private async checkDatabase(): Promise<CheckResult> {
        const t0 = Date.now();
        try {
            await this.prisma.$queryRawUnsafe<unknown>('SELECT 1');
            const latencyMs = Date.now() - t0;

            if (latencyMs >= dbCritLatencyMs) {
                return {
                    status: 'degraded',
                    latencyMs,
                    message: `Latence critique : ${latencyMs}ms`,
                };
            }
            if (latencyMs >= dbWarnLatencyMs) {
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
            await this.cache.set(cacheProbeKey, cacheProbeValue, cacheProbeTtlMs);
            const value = await this.cache.get<string>(cacheProbeKey);
            const latencyMs = Date.now() - t0;

            if (value !== cacheProbeValue) {
                return { status: 'degraded', latencyMs, message: 'Round-trip cache incohérent' };
            }
            if (latencyMs >= cacheCritLatencyMs) {
                return {
                    status: 'degraded',
                    latencyMs,
                    message: `Latence critique : ${latencyMs}ms`,
                };
            }
            if (latencyMs >= cacheWarnLatencyMs) {
                return {
                    status: 'degraded',
                    latencyMs,
                    message: `Latence élevée : ${latencyMs}ms`,
                };
            }
            return { status: 'ok', latencyMs };
        } catch (err: unknown) {
            this.logger.warn(`Cache check failed: ${this.extractMessage(err)}`);
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

        if (usagePercent >= memoryCritThreshold) {
            return {
                status: 'down',
                details,
                message: `Mémoire critique : ${details.usagePercent}%`,
            };
        }
        if (usagePercent >= memoryWarnThreshold) {
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
