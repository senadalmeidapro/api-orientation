import SibApiV3Sdk, {
  type SendTransacEmailRequest,
  type SendTransacEmailResponse,
  type TransactionalEmailsApi,
} from 'sib-api-v3-sdk';

export class BrevoClient {
  private readonly apiInstance: TransactionalEmailsApi;

  constructor() {
    const client = SibApiV3Sdk.ApiClient.instance;
    const authentication = client.authentications['api-key'];
    if (!authentication) {
      throw new Error('Brevo API key authentication method is unavailable');
    }
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      throw new Error('BREVO_API_KEY is not configured');
    }
    authentication.apiKey = apiKey;

    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  sendEmail(params: SendTransacEmailRequest): Promise<SendTransacEmailResponse> {
    return this.apiInstance.sendTransacEmail(params);
  }
}
