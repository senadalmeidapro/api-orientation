import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
    private s3: S3Client | null = null;
    private bucket = process.env.S3_BUCKET;
    private region = process.env.S3_REGION;
    private publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;

    constructor() {
        if (
            this.bucket &&
            this.region &&
            process.env.S3_ACCESS_KEY_ID &&
            process.env.S3_SECRET_ACCESS_KEY
        ) {
            this.s3 = new S3Client({
                region: this.region,
                credentials: {
                    accessKeyId: process.env.S3_ACCESS_KEY_ID,
                    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
                },
            });
        }
    }

    isS3Enabled() {
        return Boolean(this.s3 && this.bucket && this.region);
    }

    async uploadBuffer(buffer: Buffer, contentType: string, keyPrefix = 'treasure-maps') {
        if (!this.isS3Enabled()) {
            const dir = path.join(process.cwd(), 'storage', keyPrefix);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            const filename = `${randomUUID()}.pdf`;
            const filePath = path.join(dir, filename);
            fs.writeFileSync(filePath, buffer);
            return `storage/${keyPrefix}/${filename}`;
        }

        const key = `${keyPrefix}/${randomUUID()}.pdf`;

        await this.s3!.send(
            new PutObjectCommand({
                Bucket: this.bucket!,
                Key: key,
                Body: buffer,
                ContentType: contentType,
            }),
        );

        if (this.publicBaseUrl) return `${this.publicBaseUrl}/${key}`;
        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    }
}
