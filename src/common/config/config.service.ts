import { Injectable, Logger } from '@nestjs/common';
import 'dotenv/config';

@Injectable()
export class ConfigService {
    private readonly logger = new Logger(ConfigService.name);

    /* ─────────────────────────────────────────
     * ENGINE
     * ───────────────────────────────────────── */
    readonly engine = {
        nodeEnv: this.str('NODE_ENV'),
        nodeVersion: this.str('NODE_VERSION'),
        npmVersion: this.str('NPM_VERSION'),
    };

    /* ─────────────────────────────────────────
     * APP / SERVER
     * ───────────────────────────────────────── */
    readonly app = {
        name: this.str('APP_NAME'),
        env: this.str('APP_ENV'),
        version: this.str('APP_VERSION'),
        description: this.str('APP_DESCRIPTION'),
        host: this.str('APP_HOST', '0.0.0.0'),
        port: this.num('APP_PORT', 3000),
        url: this.str('APP_URL'),
        frontendUrl: this.str('FRONTEND_URL'),
        debug: this.bool('APP_DEBUG'),
        local: this.str('APP_LOCAL'),
        fakerLocal: this.str('APP_FAKER_LOCAL'),
        fallbackLocal: this.str('APP_FALLBACK_LOCAL'),
        supportEmail: this.str('SUPPORT_EMAIL'),
        trustProxy: this.bool('TRUST_PROXY'),
        logLevel: this.str('LOG_LEVEL', 'info'),
    };

    /* ─────────────────────────────────────────
     * SECURITY / CORS
     * ───────────────────────────────────────── */
    readonly cors = {
        origin: this.list('CORS_ORIGIN'),
        credentials: this.bool('CORS_CREDENTIALS'),
        maxAge: this.num('CORS_MAX_AGE', 600),
        rateLimit: {
            windowMs: this.num('RATE_LIMIT_WINDOW_MS'),
            max: this.num('RATE_LIMIT_MAX'),
        },
        sessionKey: this.str('SECURE_SESSION_KEY'),
        csrfEnabled: this.bool('CSRF_ENABLED'),
    };

    /* ─────────────────────────────────────────
     * ADMIN
     * ───────────────────────────────────────── */
    readonly admin = {
        email: this.str('ADMIN_EMAIL'),
        key: this.str('ADMIN_KEY'),
    };

    /* ─────────────────────────────────────────
     * DATABASE
     * ───────────────────────────────────────── */
    readonly database = {
        url: this.str('DATABASE_URL'),
    };

    /* ─────────────────────────────────────────
     * JWT
     * ───────────────────────────────────────── */
    readonly jwt = {
        accessSecret: this.str('JWT_ACCESS_SECRET'),
        accessExpiresIn: this.num('JWT_ACCESS_EXPIRES_IN'),
        refreshSecret: this.str('JWT_REFRESH_SECRET'),
        refreshExpiresIn: this.num('JWT_REFRESH_EXPIRES_IN'),
        saltRounds: this.num('JWT_SALT_ROUNDS'),
        issuer: this.str('JWT_ISSUER'),
        audience: this.str('JWT_AUDIENCE'),
    };

    /* ─────────────────────────────────────────
     * OAUTH
     * ───────────────────────────────────────── */
    readonly oauth = {
        google: {
            clientId: this.str('GOOGLE_CLIENT_ID'),
            clientSecret: this.str('GOOGLE_CLIENT_SECRET'),
            callbackUrl: this.str('GOOGLE_CALLBACK_URL'),
        },
    };

    /* ─────────────────────────────────────────
     * EMAIL — SMTP (dev) + Brevo (prod)
     * ───────────────────────────────────────── */
    readonly email = {
        // SMTP
        host: this.str('EMAIL_HOST'),
        port: this.num('EMAIL_PORT'),
        secure: this.bool('EMAIL_SECURE'),
        useTLS: this.bool('EMAIL_USE_TLS'),
        user: this.str('EMAIL_USER'),
        password: this.str('EMAIL_PASSWORD'),
        fromAddress: this.str('EMAIL_FROM_ADDRESS'),
        fromName: this.str('EMAIL_FROM_NAME'),
        // helper formatté pour nodemailer : "Orient BJ <email@...>"
        get from() {
            return `${this.fromName} <${this.fromAddress}>`;
        },
        templatePath: this.str('EMAIL_TEMPLATE_PATH'),
        defaultLanguage: this.str('EMAIL_DEFAULT_LANGUAGE'),
        logging: this.bool('EMAIL_LOGGING'),
        connectionTimeout: this.num('EMAIL_CONNECTION_TIMEOUT'),
        greetingTimeout: this.num('EMAIL_GREETING_TIMEOUT'),
        socketTimeout: this.num('EMAIL_SOCKET_TIMEOUT'),
        // Brevo API
        brevo: {
            apiKey: this.str('BREVO_API_KEY'),
            baseUrl: this.str('BREVO_BASE_URL'),
            timeoutMs: this.num('BREVO_TIMEOUT_MS'),
            retryMaxAttempts: this.num('BREVO_RETRY_MAX_ATTEMPTS'),
            retryBaseDelayMs: this.num('BREVO_RETRY_BASE_DELAY_MS'),
            retryMaxDelayMs: this.num('BREVO_RETRY_MAX_DELAY_MS'),
        },
    };

    /* ─────────────────────────────────────────
     * REDIS
     * ───────────────────────────────────────── */
    readonly redis = {
        url: this.str('REDIS_URL'),
        host: this.str('REDIS_HOST'),
        port: this.num('REDIS_PORT'),
        password: this.str('REDIS_PASSWORD'),
        db: this.num('REDIS_DB', 0),
        ttl: this.num('REDIS_TTL'),
    };

    /* ─────────────────────────────────────────
     * PAIEMENT
     * ───────────────────────────────────────── */
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

    /* ─────────────────────────────────────────
     * PDF / PUPPETEER
     * ───────────────────────────────────────── */
    readonly pdf = {
        executablePath: this.str('PUPPETEER_EXECUTABLE_PATH'),
        tempDir: this.str('PDF_TEMP_DIR'),
        pageSize: this.str('PDF_PAGE_SIZE'),
        margin: this.num('PDF_MARGIN'),
    };

    /* ─────────────────────────────────────────
     * IA / OPENAI
     * ───────────────────────────────────────── */
    readonly openai = {
        apiKey: this.str('OPENAI_API_KEY'),
        model: this.str('OPENAI_MODEL'),
        baseUrl: this.str('OPENAI_BASE_URL'),
        timeoutMs: this.num('OPENAI_TIMEOUT_MS'),
        temperature: this.num('OPENAI_TEMPERATURE'),
    };

    /* ─────────────────────────────────────────
     * HELPERS PRIVÉS
     * ───────────────────────────────────────── */
    private str(key: string, def?: string): string {
        const value = process.env[key] ?? def;
        if (value === undefined || value === '') {
            const msg = `CONFIG → Missing env var: ${key}`;
            this.logger.error(msg);
            throw new Error(msg);
        }
        if (!process.env[key] && def !== undefined) {
            this.logger.warn(`ENV ${key} missing, defaulting to "${def}"`);
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
}
