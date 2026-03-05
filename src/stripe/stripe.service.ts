import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async crearPaymentIntent(
    monto: number,
    currency = 'mxn',
    metadata?: Record<string, string>,
  ) {
    // Stripe trabaja en centavos
    return this.stripe.paymentIntents.create({
      amount: Math.round(monto * 100),
      currency,
      metadata: metadata ?? {},
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });
  }

  construirEvento(payload: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  }
}
