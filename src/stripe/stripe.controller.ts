import { Controller, Post } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('payment-sheet')
  async createPaymentIntent() {
    const paymentIntent = await this.stripeService.paymentSheet();

    return {
      ...paymentIntent,
    };
  }
}
