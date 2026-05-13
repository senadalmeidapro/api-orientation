import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { GoogleGenerativeAI, ResponseSchema, SchemaType } from '@google/generative-ai';
import { JsonSchemaFormat } from './ai.client';

@Injectable()
export class GoogleAiClient {
  private client: GoogleGenerativeAI | null = null;
  private readonly apiKey = process.env.GOOGLE_AI_API_KEY;
  private readonly model = process.env.GOOGLE_AI_MODEL ?? 'gemini-2.0-flash';
  private readonly temperature = Number(process.env.AI_TEMPERATURE ?? 0.3);
  private readonly timeoutMs = Number(process.env.AI_TIMEOUT_MS ?? 15000);

  constructor() {
    if (this.apiKey) {
      this.client = new GoogleGenerativeAI(this.apiKey);
    }
  }

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
    if (!this.client) {
      throw new BadRequestException('GOOGLE_AI_API_KEY manquant');
    }

    const fullPrompt = params.instructions
      ? `${params.instructions}\n\n${params.input}`
      : params.input;

    try {
      const genAI = this.client;
      const model = genAI.getGenerativeModel({ model: this.model });

      const response = await this.withTimeout(
        model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [{ text: fullPrompt }],
            },
          ],
          generationConfig: {
            temperature: params.temperature ?? this.temperature,
          },
        }),
        this.timeoutMs,
      );

      const text = response.response.text();
      return {
        text,
        raw: response,
      };
    } catch (err) {
      if (err instanceof ServiceUnavailableException) {
        throw err;
      }
      throw new ServiceUnavailableException('Appel Google Gemini indisponible');
    }
  }

  async respondJson(params: {
    instructions: string;
    input: string;
    schema: JsonSchemaFormat;
    temperature?: number;
  }) {
    if (!this.client) {
      throw new BadRequestException('GOOGLE_AI_API_KEY manquant');
    }

    const fullPrompt = params.instructions
      ? `${params.instructions}\n\n${params.input}`
      : params.input;

    try {
      const genAI = this.client;
      const model = genAI.getGenerativeModel({
        model: this.model,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: this.convertSchemaToGoogleFormat(params.schema),
          temperature: params.temperature ?? this.temperature,
        },
      });

      const response = await this.withTimeout(
        model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [{ text: fullPrompt }],
            },
          ],
        }),
        this.timeoutMs,
      );

      const text = response.response.text();
      try {
        return {
          json: JSON.parse(text) as Record<string, unknown>,
          raw: response,
        };
      } catch {
        throw new ServiceUnavailableException('Reponse IA invalide (JSON)');
      }
    } catch (err) {
      if (err instanceof ServiceUnavailableException) {
        throw err;
      }
      throw new ServiceUnavailableException('Appel Google Gemini indisponible');
    }
  }

  private convertSchemaToGoogleFormat(schema: JsonSchemaFormat): ResponseSchema {
    const jsonSchema = schema.schema;

    const buildProperties = (obj: Record<string, unknown>): Record<string, unknown> => {
      const props: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          const val = value as Record<string, unknown>;
          if (val.type === 'object') {
            props[key] = {
              type: SchemaType.OBJECT,
              properties: buildProperties(val.properties as Record<string, unknown>),
              required: val.required ?? [],
            };
          } else if (val.type === 'array') {
            props[key] = {
              type: SchemaType.ARRAY,
              items: {
                type: this.mapJsonTypeToGoogleType(
                  (val.items as Record<string, unknown>)?.type as string,
                ),
              },
            };
          } else {
            props[key] = {
              type: this.mapJsonTypeToGoogleType(val.type as string),
              description: val.description,
            };
          }
        }
      }

      return props;
    };

    return {
      type: SchemaType.OBJECT,
      properties: buildProperties(jsonSchema.properties as Record<string, unknown>),
      required: (jsonSchema.required as string[]) ?? [],
    } as ResponseSchema;
  }

  private mapJsonTypeToGoogleType(jsonType: string): SchemaType {
    const typeMap: Record<string, SchemaType> = {
      string: SchemaType.STRING,
      number: SchemaType.NUMBER,
      integer: SchemaType.INTEGER,
      boolean: SchemaType.BOOLEAN,
      array: SchemaType.ARRAY,
      object: SchemaType.OBJECT,
    };
    return typeMap[jsonType] ?? SchemaType.STRING;
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new ServiceUnavailableException('Timeout Google Gemini')), ms),
    );
    return Promise.race([promise, timeout]);
  }
}
