import { Injectable, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { AiClient, JsonSchemaFormat } from './ai.client';
import { GoogleAiClient } from './google-ai.client';

export interface IAiProvider {
    chat(prompt: string, options?: { temperature?: number; max_tokens?: number }): Promise<string>;
    respondText(params: {
        instructions: string;
        input: string;
        temperature?: number;
    }): Promise<{ text: string; raw: unknown }>;
    respondJson(params: {
        instructions: string;
        input: string;
        schema: JsonSchemaFormat;
        temperature?: number;
    }): Promise<{ json: Record<string, unknown>; raw: unknown }>;
}

@Injectable()
export class AiProviderFactory {
    private provider: IAiProvider | null = null;
    private readonly selectedProvider = process.env.AI_PROVIDER?.toLowerCase() ?? 'openai';

    constructor(openaiClient: AiClient, googleAiClient: GoogleAiClient) {
        if (this.selectedProvider === 'google') {
            this.provider = googleAiClient as IAiProvider;
        } else {
            this.provider = openaiClient as IAiProvider;
        }

        if (!this.provider) {
            throw new BadRequestException(`AI provider '${this.selectedProvider}' non configuré`);
        }
    }

    getProvider(): IAiProvider {
        if (!this.provider) {
            throw new ServiceUnavailableException('AI provider non disponible');
        }
        return this.provider;
    }

    getProviderName(): string {
        return this.selectedProvider;
    }
}
