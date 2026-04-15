export type EmailErrorCode =
    | 'configuration_error'
    | 'invalid_payload'
    | 'provider_error'
    | 'rate_limited'
    | 'timeout'
    | 'unauthorized'
    | 'forbidden'
    | 'network_error'
    | 'template_not_configured';

export type EmailSendErrorOptions = {
    code: EmailErrorCode;
    provider?: string;
    retryable?: boolean;
    status?: number;
};

export class EmailSendError extends Error {
    readonly code: EmailErrorCode;
    readonly provider?: string;
    readonly retryable: boolean;
    readonly status?: number;

    constructor(message: string, options: EmailSendErrorOptions) {
        super(message);
        this.name = 'EmailSendError';
        this.code = options.code;
        this.provider = options.provider;
        this.retryable = options.retryable ?? false;
        this.status = options.status;
    }
}

export class EmailConfigurationError extends EmailSendError {
    readonly field?: string;

    constructor(message: string, field?: string) {
        super(message, { code: 'configuration_error' });
        this.name = 'EmailConfigurationError';
        this.field = field;
    }
}

export class EmailValidationError extends EmailSendError {
    readonly field?: string;

    constructor(message: string, field?: string) {
        super(message, { code: 'invalid_payload' });
        this.name = 'EmailValidationError';
        this.field = field;
    }
}
