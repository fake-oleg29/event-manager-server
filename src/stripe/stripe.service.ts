import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') as string,
      {
        apiVersion: '2026-01-28.clover',
      },
    );
  }

  async paymentSheet() {
    const customer = await this.stripe.customers.create({});
    const customerSession = await this.stripe.customerSessions.create({
      customer: customer.id,
      components: {
        mobile_payment_element: {
          enabled: true,
          features: {
            payment_method_save: 'enabled',
            payment_method_redisplay: 'enabled',
            payment_method_remove: 'enabled',
          },
        },
      },
    });
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: 10000,
      currency: 'uah',
      customer: customer.id,
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter
      // is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      paymentIntent: paymentIntent.client_secret,
      customerSessionClientSecret: customerSession.client_secret,
      customer: customer.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    };
  }
}
