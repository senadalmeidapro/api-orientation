import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

const DEFAULT_APP_NAME = 'POPI 2.0 API';
const DEFAULT_APP_VERSION = '1.0.0';
const HEALTH_STATUS_OK = 'ok';

type HealthResponse = {
    status: string;
    service: string;
    version: string;
    timestamp: string;
};

@Public()
@Controller('health')
export class HealthController {
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
