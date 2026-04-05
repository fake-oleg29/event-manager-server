import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

function emptyToUndefined({ value }: { value: unknown }) {
  if (value === '' || value === undefined || value === null) return undefined;
  return value;
}

function trimSearch({ value }: { value: unknown }) {
  if (value === '' || value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return undefined;
  const t = value.trim();
  return t === '' ? undefined : t;
}

function toOptionalNumber({ value }: { value: unknown }): number | undefined {
  if (value === '' || value === undefined || value === null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export class EventQueryDto {
  /** Case-insensitive partial match on event title */
  @IsOptional()
  @Transform(trimSearch)
  @IsString()
  @MaxLength(200)
  search?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsUUID()
  organizerId?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsUUID()
  venueId?: string;

  /** Range start (YYYY-MM-DD); events with startDate on or after this day */
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsDateString()
  dateFrom?: string;

  /** Range end (YYYY-MM-DD); events with startDate on or before this day */
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(0)
  priceMin?: number;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(0)
  priceMax?: number;
}
