import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';
import {
  IsString,
  IsNumber,
  IsDate,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { TicketType, TicketStatus } from '@prisma/client';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsString()
  @IsOptional()
  eventId?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  @IsEnum(TicketType)
  type?: TicketType;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  seatNumber?: string;

  @IsString()
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsDate()
  @IsOptional()
  purchaseDate?: Date;
}
