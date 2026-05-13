import type { LoggerService } from '@nestjs/common';
import pino from 'pino';

export class PinoLoggerService implements LoggerService {
  private logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
  });

  log(message: any, context?: string) {
    this.logger.info({ context }, message);
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error({ context, trace }, message);
  }

  warn(message: any, context?: string) {
    this.logger.warn({ context }, message);
  }

  debug(message: any, context?: string) {
    this.logger.debug({ context }, message);
  }

  verbose(message: any, context?: string) {
    this.logger.trace({ context }, message);
  }
}
