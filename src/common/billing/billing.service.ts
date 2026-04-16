// import { BadRequestException, Injectable } from '@nestjs/common';
// import axios from 'axios';
// import { PrismaService } from '../../prisma/prisma.service';
// import { ConfigService } from '../config/config.service';
// import { PaymentPlan, BillingInterval } from '@prisma/client';
// import { createHmac, timingSafeEqual } from 'crypto';

// type PlanConfig = {
//     plan: PaymentPlan;
//     interval: BillingInterval;
//     amount: number;
//     currency: string;
//     name: string;
//     limits: Record<string, any>;
// };

// const PLANS: Record<string, PlanConfig> = {
//     FREE: {
//         plan: PaymentPlan.FREE,
//         interval: BillingInterval.MONTHLY,
//         amount: 0,
//         currency: 'XOF',
//         name: 'Free',
//         limits: { sites: 1, pages: 3, storageMb: 100 },
//     },
//     PROFESSIONAL: {
//         plan: PaymentPlan.PROFESSIONAL,
//         interval: BillingInterval.MONTHLY,
//         amount: 5000,
//         currency: 'XOF',
//         name: 'Professional',
//         limits: { sites: 10, pages: 100, storageMb: 2048 },
//     },
// };

// @Injectable()
// export class BillingService {
//     constructor(
//         private readonly prisma: PrismaService,
//         private readonly config: ConfigService,
//     ) {}

//     async getOrCreateSubscription(userId: string) {
//         const existing = await this.prisma.subscription.findUnique({
//             where: { user_id: userId },
//         });
//         if (existing) return existing;

//         const plan = PLANS.FREE;
//         const now = new Date();
//         const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

//         return this.prisma.subscription.create({
//             data: {
//                 user_id: userId,
//                 plan: plan.plan,
//                 interval: plan.interval,
//                 status: 'active',
//                 current_period_start: now,
//                 current_period_end: end,
//                 limits: plan.limits,
//                 usage: {},
//             },
//         });
//     }

//     async createCheckout(userId: string, planKey: string) {
//         const key = planKey?.toUpperCase();
//         const plan = PLANS[key];
//         if (!plan || plan.plan === PaymentPlan.FREE) {
//             throw new BadRequestException('Plan invalide');
//         }

//         const user = await this.prisma.user.findUnique({
//             where: { id: userId },
//         });
//         if (!user) {
//             throw new BadRequestException('Utilisateur introuvable');
//         }

//         const baseUrl =
//             this.config.payment.fedapay.environment === 'live'
//                 ? 'https://api.fedapay.com/v1'
//                 : 'https://sandbox-api.fedapay.com/v1';

//         const transaction = await axios.post(
//             `${baseUrl}/transactions`,
//             {
//                 description: `${plan.name} plan`,
//                 amount: plan.amount,
//                 currency: { iso: plan.currency },
//                 callback_url: this.config.payment.urls.success,
//                 customer: {
//                     email: user.email,
//                     firstname: user.first_name ?? user.username,
//                     lastname: user.last_name ?? '',
//                     phone_number: user.phone_number ?? undefined,
//                 },
//                 custom_metadata: {
//                     userId,
//                     plan: plan.plan,
//                 },
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${this.config.payment.fedapay.apiKey}`,
//                 },
//             },
//         );

//         const transactionId = transaction.data?.id;
//         if (!transactionId) {
//             throw new BadRequestException('Transaction FedaPay invalide');
//         }

//         const tokenResp = await axios.post(
//             `${baseUrl}/transactions/${transactionId}/token`,
//             {},
//             {
//                 headers: {
//                     Authorization: `Bearer ${this.config.payment.fedapay.apiKey}`,
//                 },
//             },
//         );

//         const paymentUrl = tokenResp.data?.url;

//         await this.ensureInvoice(userId, plan, transactionId, paymentUrl);

//         return { url: paymentUrl, transactionId };
//     }

//     async handleWebhook(payload: any, signature?: string, rawBody?: string) {
//         if (this.config.payment.fedapay.webhookToken) {
//             this.verifySignature(signature, rawBody);
//         }

//         const eventType =
//             payload?.event ||
//             payload?.type ||
//             payload?.name ||
//             payload?.data?.type;
//         const data = payload?.data || payload?.transaction || payload?.object || payload;

//         const transactionId = data?.id || data?.transaction_id;
//         if (!transactionId) {
//             throw new BadRequestException('Transaction ID manquant');
//         }

//         const status = data?.status || data?.state;

//         if (status === 'approved' || eventType === 'transaction.approved') {
//             await this.markInvoicePaid(transactionId);
//         }

//         return { received: true };
//     }

//     private verifySignature(signature?: string, rawBody?: string) {
//         if (!signature || !rawBody) {
//             throw new BadRequestException('Signature invalide');
//         }

//         const secret = this.config.payment.fedapay.webhookToken;
//         const normalized = signature.startsWith('sha256=')
//             ? signature.slice('sha256='.length)
//             : signature;

//         const expected = createHmac('sha256', secret).update(rawBody).digest('hex');

//         const sigBuf = Buffer.from(normalized, 'hex');
//         const expBuf = Buffer.from(expected, 'hex');
//         if (sigBuf.length !== expBuf.length) {
//             throw new BadRequestException('Signature invalide');
//         }
//         if (!timingSafeEqual(sigBuf, expBuf)) {
//             throw new BadRequestException('Signature invalide');
//         }
//     }

//     private async ensureInvoice(
//         userId: string,
//         plan: PlanConfig,
//         externalId: number,
//         externalUrl?: string,
//     ) {
//         const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

//         await this.prisma.invoice.create({
//             data: {
//                 user_id: userId,
//                 invoice_number: invoiceNumber,
//                 amount_due: plan.amount,
//                 amount_paid: 0,
//                 currency: plan.currency,
//                 status: 'pending',
//                 external_id: String(externalId),
//                 external_url: externalUrl,
//                 line_items: [
//                     {
//                         name: plan.name,
//                         plan: plan.plan,
//                         amount: plan.amount,
//                         interval: plan.interval,
//                     },
//                 ],
//             },
//         });
//     }

//     private async markInvoicePaid(externalId: number) {
//         const invoice = await this.prisma.invoice.findFirst({
//             where: { external_id: String(externalId) },
//         });
//         if (!invoice) return;

//         await this.prisma.invoice.update({
//             where: { id: invoice.id },
//             data: {
//                 status: 'paid',
//                 amount_paid: invoice.amount_due,
//                 paid_at: new Date(),
//             },
//         });

//         const plan = PLANS.PROFESSIONAL;
//         const now = new Date();
//         const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

//         await this.prisma.subscription.upsert({
//             where: { user_id: invoice.user_id },
//             update: {
//                 plan: plan.plan,
//                 interval: plan.interval,
//                 status: 'active',
//                 current_period_start: now,
//                 current_period_end: end,
//                 limits: plan.limits,
//             },
//             create: {
//                 user_id: invoice.user_id,
//                 plan: plan.plan,
//                 interval: plan.interval,
//                 status: 'active',
//                 current_period_start: now,
//                 current_period_end: end,
//                 limits: plan.limits,
//                 usage: {},
//             },
//         });
//     }
// }
