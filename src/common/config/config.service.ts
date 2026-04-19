import { Injectable, Logger } from '@nestjs/common';
import 'dotenv/config';

@Injectable()
export class ConfigService {
    private readonly logger = new Logger(ConfigService.name);

    /* =====================================================
     * ENGINE / NODE CONFIGURATION
     * ===================================================== */
    readonly engine = {
        nodeEnv: this.str('NODE_ENV'),
        nodeVersion: this.str('NODE_VERSION'),
        npmVersion: this.str('NPM_VERSION'),
    };
    /* =====================================================
     * APP / SERVER CONFIGURATION
     * ===================================================== */
    readonly app = {
        name: this.str('APP_NAME'),
        env: this.str('APP_ENV'),
        host: this.strFrom(['APP_HOST', 'HOST'], '0.0.0.0'),
        port: this.numFrom(['APP_PORT', 'PORT'], 3000),
        url: this.str('APP_URL'),
        frontUrl: this.str('FRONT_URL'),
        debug: this.bool('APP_DEBUG'),
        local: this.str('APP_LOCAL'),
        backUrl: this.str('BACK_URL'),
        supportEmail: this.str('SUPPORT_EMAIL'),
        fakerLocal: this.str('APP_FAKER_LOCAL'),
        fallbackLocal: this.str('APP_FALLBACK_LOCAL'),
    };
    /* =====================================================
     * SECURITY CONFIGURATION
     * ===================================================== */
    readonly cors = {
        origin: this.list('CORS_ORIGIN'),
        credentials: this.bool('CORS_CREDENTIALS'),
        sessionKey: this.str('SECURE_SESSION_KEY'),
        rateLimit: {
            windowMs: this.num('RATE_LIMIT_WINDOW_MS'),
            max: this.num('RATE_LIMIT_MAX'),
        },
        csrfEnabled: this.bool('CSRF_ENABLED'),
    };
    /* =====================================================
     * SECURITY CONFIGURATION
     * ===================================================== */
    readonly admin = {
        email: this.str('ADMIN_EMAIL'),
        key: this.str('ADMIN_KEY'),
    };
    /* =====================================================
     * DATABASE CONFIGURATION
     * ===================================================== */
    readonly database = {
        postgresql: {
            url: this.str('DATABASE_URL'),
        },
        mongodb: {},
    };
    /* =====================================================
     * AUTH / JWT CONFIGURATION
     * ===================================================== */
    readonly jwt = {
        secret: this.str('JWT_ACCESS_SECRET'),
        expiresIn: this.num('JWT_ACCESS_EXPIRES_IN'),
        saltRounds: this.num('JWT_SALT_ROUNDS'),
        refreshSecret: this.str('JWT_REFRESH_SECRET'),
        refreshExpiresIn: this.num('JWT_REFRESH_EXPIRES_IN'),
        issuer: this.str('JWT_ISSUER'),
        audience: this.str('JWT_AUDIENCE'),
    };
    /* =====================================================
     * OAUTH PROVIDERS
     * ===================================================== */
    readonly oauth = {
        google: {
            clientId: this.str('GOOGLE_CLIENT_ID'),
            clientSecret: this.str('GOOGLE_CLIENT_SECRET'),
            callbackUrl: this.str('GOOGLE_CALLBACK_URL'),
        },
    };
    /* =====================================================
     * EMAIL / SMTP CONFIGURATION
     * ===================================================== */
    readonly email = {
        apiKey: this.str('BREVO_API_KEY'),
        host: this.str('EMAIL_HOST'),
        port: this.num('EMAIL_PORT'),
        useTLS: this.bool('EMAIL_USE_TLS'),
        secure: this.bool('EMAIL_SECURE'),
        user: this.str('EMAIL_USER'),
        password: this.str('EMAIL_PASSWORD'),
        from: this.str('EMAIL_FROM'),
        connectionTimeout: this.num('EMAIL_CONNECTION_TIMEOUT'),
        greetingTimeout: this.num('EMAIL_GREETING_TIMEOUT'),
        socketTimeout: this.num('EMAIL_SOCKET_TIMEOUT'),
        templatePath: this.str('EMAIL_TEMPLATE_PATH'),
        defaultLanguage: this.str('EMAIL_DEFAULT_LANGUAGE'),
        logging: this.bool('EMAIL_LOGGING'),
    };
    /* =====================================================
     * STORAGE / CLOUD CONFIGURATION
     * ===================================================== */
    // readonly storage = {
    //     uploadDir: this.str('UPLOAD_DIR'),
    //     maxFileSizeMb: this.num('MAX_FILE_SIZE_MB'),
    //     cloudinary: {
    //         url: this.str('CLOUDINARY_URL'),
    //         cloudName: this.str('CLOUDINARY_CLOUD_NAME'),
    //         apiKey: this.str('CLOUDINARY_API_KEY'),
    //         apiSecret: this.str('CLOUDINARY_API_SECRET'),
    //         secure: this.bool('CLOUDINARY_SECURE'),
    //         validate: this.bool('CLOUDINARY_VALIDATE'),
    //         optimize: this.bool('CLOUDINARY_OPTIMIZE'),
    //         transformations: this.bool('CLOUDINARY_TRANSFORMATIONS'),
    //     },
    // };
    /* =====================================================
     * CACHE / REDIS CONFIGURATION
     * ===================================================== */
    readonly redis = {
        url: this.str('REDIS_URL'),
        host: this.str('REDIS_HOST'),
        port: this.num('REDIS_PORT'),
        password: this.str('REDIS_PASSWORD'),
        db: this.num('REDIS_DB', 0),
        ttl: this.num('REDIS_TTL'),
    };
    /* =====================================================
     * PAYMENT PROVIDERS
     * ===================================================== */
    readonly payment = {
        stripe: {
            secretKey: this.str('STRIPE_SECRET_KEY'),
            publicKey: this.str('STRIPE_PUBLIC_KEY'),
            webhookSecret: this.str('STRIPE_WEBHOOK_SECRET'),
            apiVersion: this.str('STRIPE_API_VERSION'),
        },
        fedapay: {
            apiKey: this.str('FEDAPAY_API_KEY'),
            publicKey: this.str('FEDAPAY_PUBLIC_KEY'),
            environment: this.str('FEDAPAY_ENVIRONMENT'),
            webhookToken: this.str('FEDAPAY_WEBHOOK_TOKEN'),
            merchant: {
                name: this.str('FEDAPAY_MERCHANT_NAME'),
                email: this.str('FEDAPAY_MERCHANT_EMAIL'),
                phone: this.str('FEDAPAY_MERCHANT_PHONE'),
            },
        },
        urls: {
            success: this.str('PAYMENT_SUCCESS_URL'),
            cancel: this.str('PAYMENT_CANCEL_URL'),
            webhook: this.str('PAYMENT_WEBHOOK_URL'),
        },
    };
    /* =====================================================
     * PDF / PUPPETEER CONFIGURATION
     * ===================================================== */
    readonly pdf = {
        puppeteerExecutablePath: this.str('PUPPETEER_EXECUTABLE_PATH'),
        tempDir: this.str('PDF_TEMP_DIR'),
        pageSize: this.str('PDF_PAGE_SIZE'),
        margin: this.num('PDF_MARGIN'),
    };

    /* =====================================================
     * INTERNAL HELPERS
     * ===================================================== */
    private str(key: string, def?: string): string {
        const value = process.env[key] ?? def;
        if (!value) {
            const msg = `CONFIG → Missing env var: ${key}`;
            this.logger.error(msg);
            throw new Error(msg);
        }
        if (!process.env[key] && def !== undefined) {
            this.logger.warn(`ENV ${key} missing, defaulting to ${def}`);
        }
        return value;
    }

    private num(key: string, def?: number): number {
        const raw = process.env[key];
        const value = raw !== undefined ? Number(raw) : def;
        if (value === undefined || Number.isNaN(value)) {
            const msg = `CONFIG → Invalid number for ${key}: ${raw}`;
            this.logger.error(msg);
            throw new Error(msg);
        }
        if (raw === undefined && def !== undefined) {
            this.logger.warn(`ENV ${key} missing, defaulting to ${def}`);
        }
        return value;
    }

    private bool(key: string, def = false): boolean {
        const raw = process.env[key];
        if (!raw) {
            this.logger.warn(`ENV ${key} missing, defaulting to ${def}`);
            return def;
        }
        return ['true', '1', 'yes', 'on'].includes(raw.toLowerCase());
    }

    private list(key: string, sep = ',', def: string[] = []): string[] {
        const raw = process.env[key];
        if (!raw) {
            this.logger.warn(`ENV ${key} missing, defaulting to ${JSON.stringify(def)}`);
            return def;
        }
        return raw
            .split(sep)
            .map((s) => s.trim())
            .filter(Boolean);
    }

    private optStr(key: string): string | undefined {
        const value = process.env[key];
        if (!value) {
            return undefined;
        }
        return value;
    }

    private strFrom(keys: string[], def?: string): string {
        for (const [index, key] of keys.entries()) {
            const value = process.env[key];
            if (!value) {
                continue;
            }
            if (index > 0) {
                this.logger.warn(`ENV ${keys[0]} missing, using ${key}`);
            }
            return value;
        }

        if (def !== undefined) {
            this.logger.warn(`ENV ${keys.join(' / ')} missing, defaulting to ${def}`);
            return def;
        }

        const msg = `CONFIG → Missing env var: ${keys.join(' / ')}`;
        this.logger.error(msg);
        throw new Error(msg);
    }

    private numFrom(keys: string[], def?: number): number {
        for (const [index, key] of keys.entries()) {
            const raw = process.env[key];
            if (raw === undefined || raw.trim() === '') {
                continue;
            }
            const value = Number(raw);
            if (Number.isNaN(value)) {
                const msg = `CONFIG → Invalid number for ${key}: ${raw}`;
                this.logger.error(msg);
                throw new Error(msg);
            }
            if (index > 0) {
                this.logger.warn(`ENV ${keys[0]} missing, using ${key}`);
            }
            return value;
        }

        if (def !== undefined) {
            this.logger.warn(`ENV ${keys.join(' / ')} missing, defaulting to ${def}`);
            return def;
        }

        const msg = `CONFIG → Missing numeric env var: ${keys.join(' / ')}`;
        this.logger.error(msg);
        throw new Error(msg);
    }
}
