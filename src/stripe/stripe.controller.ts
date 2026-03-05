// stripe/stripe-webhook.controller.ts
import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { RentaService } from 'src/renta/renta.service';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  constructor(private readonly rentaService: RentaService) {}

  @Post()
  async handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook inválido: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      await this.rentaService.activarRentaPorStripe(
        event.data.object as Stripe.PaymentIntent,
      );
    }

    if (event.type === 'payment_intent.payment_failed') {
      await this.rentaService.marcarPagoFallido(
        event.data.object as Stripe.PaymentIntent,
      );
    }

    return { received: true };
  }
}
