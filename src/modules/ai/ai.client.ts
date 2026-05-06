import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';

export type JsonSchemaFormat = {
    name: string;
    schema: Record<string, unknown>;
    description?: string;
    strict?: boolean;
};

@Injectable()
export class AiClient {
    private readonly apiKey = process.env.OPENAI_API_KEY;
    private readonly baseUrl = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com';
    private readonly model = process.env.OPENAI_MODEL ?? 'gpt-4o';
    private readonly temperature = Number(process.env.AI_TEMPERATURE ?? 0.3);
    private readonly timeoutMs = Number(process.env.AI_TIMEOUT_MS ?? 15000);

    async chat(
        prompt: string,
        options: { temperature?: number; max_tokens?: number } = {},
    ): Promise<string> {
        const result = await this.respondText({
            instructions: '',
            input: prompt,
            ...(options.temperature !== undefined && { temperature: options.temperature }),
        });
        return result.text;
    }

    async respondText(params: { instructions: string; input: string; temperature?: number }) {
        const response = await this.createResponse({
            instructions: params.instructions,
            input: params.input,
            temperature: params.temperature,
            format: { type: 'text' },
        });
        return {
            text: this.extractOutputText(response),
            raw: response,
        };
    }

    async respondJson(params: {
        instructions: string;
        input: string;
        schema: JsonSchemaFormat;
        temperature?: number;
    }) {
        const response = await this.createResponse({
            instructions: params.instructions,
            input: params.input,
            temperature: params.temperature,
            format: {
                type: 'json_schema',
                json_schema: {
                    name: params.schema.name,
                    schema: params.schema.schema,
                    description: params.schema.description,
                    strict: params.schema.strict ?? true,
                },
            },
        });

        const text = this.extractOutputText(response);
        try {
            return {
                json: JSON.parse(text) as Record<string, unknown>,
                raw: response,
            };
        } catch (err) {
            if (err instanceof ServiceUnavailableException) {
                throw err;
            }
            throw new ServiceUnavailableException('Reponse IA invalide (JSON)');
        }
    }

    private async createResponse(params: {
        instructions: string;
        input: string;
        temperature?: number | undefined;
        format: { type: 'text' | 'json_schema'; json_schema?: Record<string, unknown> };
    }) {
        if (!this.apiKey) {
            throw new BadRequestException('OPENAI_API_KEY manquant');
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const res = await fetch(`${this.baseUrl}/v1/responses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    instructions: params.instructions,
                    input: params.input,
                    temperature: params.temperature ?? this.temperature,
                    text: {
                        format: params.format,
                    },
                }),
                signal: controller.signal,
            });

            const data = (await res.json()) as Record<string, unknown>;
            if (!res.ok) {
                const errorData = data?.error;
                const message =
                    errorData &&
                    typeof errorData === 'object' &&
                    typeof (errorData as Record<string, unknown>).message === 'string'
                        ? (errorData as Record<string, unknown>).message
                        : 'OpenAI request failed';
                throw new ServiceUnavailableException(message);
            }

            return data;
        } catch (err) {
            if (err instanceof ServiceUnavailableException) {
                throw err;
            }
            throw new ServiceUnavailableException('Appel OpenAI indisponible');
        } finally {
            clearTimeout(timeout);
        }
    }

    private extractOutputText(response: Record<string, unknown>) {
        const output: unknown[] = Array.isArray(response.output) ? response.output : [];
        const texts: string[] = [];
        for (const item of output) {
            if (!item || typeof item !== 'object') continue;
            const contentValue = (item as Record<string, unknown>).content;
            const content: unknown[] = Array.isArray(contentValue) ? contentValue : [];

            for (const part of content) {
                if (!part || typeof part !== 'object') continue;
                const partRecord = part as Record<string, unknown>;
                const type = typeof partRecord.type === 'string' ? partRecord.type : '';
                const text = typeof partRecord.text === 'string' ? partRecord.text : undefined;
                if (text && (type === 'output_text' || type === 'text')) {
                    texts.push(text);
                }
            }
        }
        return texts.join('\n').trim();
    }
}
