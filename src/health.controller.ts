import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiStandardErrorResponses, ApiStandardOkResponse } from './common/swagger';

const DEFAULT_APP_NAME = 'POPI 2.0 API';
const DEFAULT_APP_VERSION = '1.0.0';
const HEALTH_STATUS_OK = 'ok';

type HealthResponse = {
    status: string;
    service: string;
    version: string;
    timestamp: string;
};

@ApiTags('Health')
@Public()
@Controller('api/v1/health')
@ApiStandardErrorResponses()
export class HealthController {
    @ApiOperation({
        summary: 'Vérifier la disponibilité de l’API',
        description:
            'Endpoint public de santé applicative. Retourne l’état du service, la version déployée et un timestamp ISO.',
    })
    @ApiStandardOkResponse({
        description: 'État de santé applicatif récupéré.',
        message: 'État du service récupéré.',
        dataExample: {
            status: 'ok',
            service: 'POPI 2.0 API',
            version: '1.0.0',
            timestamp: '2026-04-15T07:37:14.360Z',
        },
    })
    @Get()
    health(): HealthResponse {
        return this.buildHealthResponse();
    }

    private buildHealthResponse(): HealthResponse {
        const service = process.env.APP_NAME ?? DEFAULT_APP_NAME;
        const version = process.env.APP_VERSION ?? DEFAULT_APP_VERSION;

        return {
            status: HEALTH_STATUS_OK,
            service,
            version,
            timestamp: new Date().toISOString(),
        };
    }
}
