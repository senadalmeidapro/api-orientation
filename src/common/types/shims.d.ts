declare module 'sib-api-v3-sdk' {
    export interface BrevoAuthentication {
        apiKey?: string;
    }

    export interface BrevoApiClientInstance {
        authentications: Record<string, BrevoAuthentication | undefined>;
    }

    export class ApiClient {
        static instance: BrevoApiClientInstance;
    }

    export interface SendSmtpEmailRecipient {
        email: string;
        name?: string;
    }

    export interface SendTransacEmailRequest {
        sender?: SendSmtpEmailRecipient;
        to: SendSmtpEmailRecipient[];
        subject?: string;
        htmlContent?: string;
        textContent?: string;
    }

    export interface SendTransacEmailResponse {
        messageId?: string;
        [key: string]: unknown;
    }

    export class TransactionalEmailsApi {
        sendTransacEmail(payload: SendTransacEmailRequest): Promise<SendTransacEmailResponse>;
    }

    interface SibApiV3SdkModule {
        ApiClient: typeof ApiClient;
        TransactionalEmailsApi: typeof TransactionalEmailsApi;
    }

    const SibApiV3Sdk: SibApiV3SdkModule;
    export default SibApiV3Sdk;
}
