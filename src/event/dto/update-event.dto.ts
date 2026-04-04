import {
  IsString,
  IsDate,
  IsOptional,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  organizerId?: string;
}
