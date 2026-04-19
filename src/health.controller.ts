import { Controller, Get, Logger, ServiceUnavailableException } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';
import { ConfigService } from './common/config/config.service';
import { main as SedderMain} from './common/seeders/seed';
// import { ApiStandardErrorResponses, ApiStandardOkResponse } from './common/swagger';

const DEFAULT_APP_NAME = 'POPI 2.0 API';
const DEFAULT_APP_VERSION = '1.0.0';
const HEALTH_STATUS_OK = 'ok';

type HealthResponse = {
    status: string;
    service: string;
    version: string;
    timestamp: string;
    database: {
        status: 'ok';
        latencyMs: number;
    };
};

type HealthErrorResponse = {
    status: 'error';
    service: string;
    version: string;
    timestamp: string;
    database: {
        status: 'down';
        message: string;
    };
};

@ApiTags('Health')
@Public()
@Controller('api/v1/health')
// @ApiStandardErrorResponses()
export class HealthController {
    private readonly logger = new Logger(HealthController.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) {}

    @ApiOperation({
        summary: 'Vérifier la disponibilité de l’API',
        description:
            'Endpoint public de santé applicative. Retourne l’état du service, la version déployée, le statut de la base de données et un timestamp ISO.',
    })
    // @ApiStandardOkResponse({
    //     description: 'État de santé applicatif récupéré.',
    //     message: 'État du service récupéré.',
    //     dataExample: {
    //         status: 'ok',
    //         service: 'POPI 2.0 API',
    //         version: '1.0.0',
    //         timestamp: '2026-04-15T07:37:14.360Z',
    //     },
    // })
    @Get()
    async health(): Promise<HealthResponse> {
        const baseResponse = this.buildBaseHealthResponse();
        const startedAt = Date.now();

        try {
            // const seeders = await SedderMain();
            const check = await this.prisma.$queryRawUnsafe('SELECT 1');
        } catch (error: unknown) {
            const message = this.extractErrorMessage(error);
            this.logger.error(`Healthcheck DB failed: ${message}`);

            const payload: HealthErrorResponse = {
                ...baseResponse,
                status: 'error',
                database: {
                    status: 'down',
                    message: 'Database unavailable',
                },
            };

            throw new ServiceUnavailableException(payload);
        }

        return {
            ...baseResponse,
            status: HEALTH_STATUS_OK,
            database: {
                status: 'ok',
                latencyMs: Date.now() - startedAt,
            },
        };
    }

    private buildBaseHealthResponse() {
        const service = this.config.app.name;
        const version = DEFAULT_APP_VERSION;

        return {
            service,
            version,
            timestamp: new Date().toISOString(),
        };
    }

    private extractErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }
}
