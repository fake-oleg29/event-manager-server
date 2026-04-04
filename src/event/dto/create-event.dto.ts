import {
  IsString,
  IsDate,
  IsOptional,
  IsArray,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  venue: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startDate: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsNumber()
  // @IsNotEmpty()
  duration: number = 1;

  @IsNumber()
  // @IsNotEmpty()
  price: number = 0;

  @IsNumber()
  // @IsNotEmpty()
  capacity: number = 10;

  @IsString()
  @IsOptional()
  organizerId: string;
}
