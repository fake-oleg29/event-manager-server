import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentIntentDto } from './create-payment-intent';

export class UpdateStripeDto extends PartialType(CreatePaymentIntentDto) {}
