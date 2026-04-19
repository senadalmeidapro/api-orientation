import { Type, applyDecorators } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiExtraModels,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiUnauthorizedResponse,
    getSchemaPath,
} from '@nestjs/swagger';

import { ApiErrorResponseDto, ApiSuccessResponseDto } from '../dto/api-response.dto';

type ApiSuccessOptions = {
    description: string;
    message?: string;
    model?: Type<unknown>;
    isArray?: boolean;
    dataExample?: unknown;
};

type ApiErrorOptions = {
    includeUnauthorized?: boolean;
    includeNotFound?: boolean;
    badRequestDescription?: string;
    unauthorizedDescription?: string;
    notFoundDescription?: string;
    internalErrorDescription?: string;
    badRequestExample?: ApiErrorResponseDto;
    unauthorizedExample?: ApiErrorResponseDto;
    notFoundExample?: ApiErrorResponseDto;
    internalErrorExample?: ApiErrorResponseDto;
};

const defaultBadRequestExample: ApiErrorResponseDto = {
    success: false,
    statusCode: 400,
    message: 'Validation des données échouée.',
    error: 'Bad Request',
    details: ['email must be an email'],
    path: '/example',
    timestamp: '2026-04-15T07:37:14.360Z',
};

const defaultUnauthorizedExample: ApiErrorResponseDto = {
    success: false,
    statusCode: 401,
    message: 'Unauthorized',
    error: 'Unauthorized',
    path: '/example',
    timestamp: '2026-04-15T07:37:14.360Z',
};

const defaultNotFoundExample: ApiErrorResponseDto = {
    success: false,
    statusCode: 404,
    message: 'Ressource introuvable.',
    error: 'Not Found',
    path: '/example',
    timestamp: '2026-04-15T07:37:14.360Z',
};

const defaultInternalErrorExample: ApiErrorResponseDto = {
    success: false,
    statusCode: 500,
    message: 'Une erreur interne est survenue.',
    error: 'Internal Server Error',
    path: '/example',
    timestamp: '2026-04-15T07:37:14.360Z',
};

const buildDataSchema = (options: ApiSuccessOptions): Record<string, unknown> => {
    if (options.model) {
        if (options.isArray) {
            return {
                type: 'array',
                items: {
                    $ref: getSchemaPath(options.model),
                },
            };
        }

        return {
            $ref: getSchemaPath(options.model),
        };
    }

    if (options.dataExample !== undefined) {
        return {
            example: options.dataExample,
        };
    }

    return { nullable: true };
};

const buildSuccessSchema = (
    statusCode: number,
    options: ApiSuccessOptions,
): Record<string, unknown> => ({
    allOf: [
        {
            $ref: getSchemaPath(ApiSuccessResponseDto),
        },
        {
            properties: {
                statusCode: { type: 'number', example: statusCode },
                message: {
                    type: 'string',
                    example:
                        options.message ??
                        (statusCode === 201
                            ? 'Ressource créée avec succès.'
                            : 'Opération effectuée avec succès.'),
                },
                data: buildDataSchema(options),
            },
        },
    ],
});

export const ApiStandardOkResponse = (options: ApiSuccessOptions) => {
    const extraModels = options.model
        ? [ApiSuccessResponseDto, options.model]
        : [ApiSuccessResponseDto];

    return applyDecorators(
        ApiExtraModels(...extraModels),
        ApiOkResponse({
            description: options.description,
            schema: buildSuccessSchema(200, options),
        }),
    );
};

export const ApiStandardCreatedResponse = (options: ApiSuccessOptions) => {
    const extraModels = options.model
        ? [ApiSuccessResponseDto, options.model]
        : [ApiSuccessResponseDto];

    return applyDecorators(
        ApiExtraModels(...extraModels),
        ApiCreatedResponse({
            description: options.description,
            schema: buildSuccessSchema(201, options),
        }),
    );
};

export const ApiStandardErrorResponses = (options: ApiErrorOptions = {}) => {
    const decorators: Array<ClassDecorator | MethodDecorator> = [
        ApiBadRequestResponse({
            description: options.badRequestDescription ?? 'Requête invalide.',
            type: ApiErrorResponseDto,
            schema: {
                example: options.badRequestExample ?? defaultBadRequestExample,
            },
        }),
        ApiInternalServerErrorResponse({
            description: options.internalErrorDescription ?? 'Erreur interne du serveur.',
            type: ApiErrorResponseDto,
            schema: {
                example: options.internalErrorExample ?? defaultInternalErrorExample,
            },
        }),
    ];

    if (options.includeUnauthorized) {
        decorators.push(
            ApiUnauthorizedResponse({
                description: options.unauthorizedDescription ?? 'Accès non autorisé.',
                type: ApiErrorResponseDto,
                schema: {
                    example: options.unauthorizedExample ?? defaultUnauthorizedExample,
                },
            }),
        );
    }

    if (options.includeNotFound) {
        decorators.push(
            ApiNotFoundResponse({
                description: options.notFoundDescription ?? 'Ressource introuvable.',
                type: ApiErrorResponseDto,
                schema: {
                    example: options.notFoundExample ?? defaultNotFoundExample,
                },
            }),
        );
    }

    return applyDecorators(ApiExtraModels(ApiErrorResponseDto), ...decorators);
};
