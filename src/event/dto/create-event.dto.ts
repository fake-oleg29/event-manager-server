import {
  IsString,
  IsDate,
  IsNumber,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

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
  @Type(() => Number)
  duration: number = 1;

  @IsNumber()
  @Type(() => Number)
  price: number = 0;

  @IsNumber()
  @Type(() => Number)
  capacity: number = 10;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({ message: 'Organizer is required' })
  @IsUUID('4', { message: 'Organizer must be a valid user id' })
  organizerId: string;
}
