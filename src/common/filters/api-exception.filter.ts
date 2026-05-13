import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

type HttpExceptionResponsePayload =
  | string
  | {
      statusCode?: number;
      message?: string | string[];
      error?: string;
    };

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const normalized = this.normalizeException(exception, statusCode);

    response.status(statusCode).json({
      success: false,
      statusCode,
      message: normalized.message,
      error: normalized.error,
      details: normalized.details,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private normalizeException(
    exception: unknown,
    statusCode: number,
  ): { message: string; error: string; details?: unknown } {
    if (!(exception instanceof HttpException)) {
      return {
        message: 'Une erreur interne est survenue.',
        error: HttpStatus[statusCode] ?? 'Internal Server Error',
      };
    }

    const payload = exception.getResponse() as HttpExceptionResponsePayload;

    if (typeof payload === 'string') {
      return {
        message: payload,
        error: HttpStatus[statusCode] ?? 'Error',
      };
    }

    const rawMessage = payload.message;
    const details = Array.isArray(rawMessage) ? rawMessage : undefined;
    const message =
      typeof rawMessage === 'string'
        ? rawMessage
        : Array.isArray(rawMessage)
          ? 'Validation des données échouée.'
          : exception.message;

    return {
      message,
      error: payload.error ?? HttpStatus[statusCode] ?? 'Error',
      details,
    };
  }
}
