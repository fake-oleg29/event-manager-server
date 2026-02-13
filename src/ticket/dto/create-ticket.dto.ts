import { TicketStatus, TicketType } from '@prisma/client';

import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDate,
  IsEnum,
} from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(TicketType)
  type: TicketType;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  seatNumber: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(TicketStatus)
  status: TicketStatus;

  @IsDate()
  @IsNotEmpty()
  purchaseDate: Date;
}
