import { IsNumber, IsString, IsOptional, Min, IsObject } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNumber()
  @Min(1)
  amount: number; // Сума в гривнях (або доларах)

  @IsString()
  @IsOptional()
  currency?: string = 'uah';

  @IsObject()
  @IsOptional()
  metadata?: Record<string, string>;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
