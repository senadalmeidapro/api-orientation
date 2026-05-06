// import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
// import type { FastifyRequest } from 'fastify';
// import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
// import { BillingService } from './billing.service';
// import { JwtAuthGuard } from '../../core/auth/guards';
// import { CurrentUser } from '@common/decorators';

// @ApiTags('Billing')
// @Controller('api/v1/billing')
// export class BillingController {
//     constructor(private readonly billing: BillingService) {}

//     @ApiBearerAuth()
//     @UseGuards(JwtAuthGuard)
//     @Post('checkout')
//     async checkout(@CurrentUser() user: any, @Body() body: { plan: string }) {
//         return this.billing.createCheckout(user.id, body.plan);
//     }

//     @Post('webhook/fedapay')
//     async webhook(@Req() req: FastifyRequest, @Body() body: any) {
//         const signature = req.headers['x-fedapay-signature'] as string | undefined;
//         const rawBody = (req as any).rawBody || JSON.stringify(body);
//         return this.billing.handleWebhook(body, signature, rawBody);
//     }

//     @ApiBearerAuth()
//     @UseGuards(JwtAuthGuard)
//     @Get('subscription')
//     async subscription(@CurrentUser() user: any) {
//         return this.billing.getOrCreateSubscription(user.id);
//     }
// }
