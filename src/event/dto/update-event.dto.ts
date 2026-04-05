import {
  IsString,
  IsDate,
  IsOptional,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

function trimOrUndefined({ value }: { value: unknown }) {
  if (value === '' || value === undefined || value === null) return undefined;
  if (typeof value === 'string') {
    const t = value.trim();
    return t === '' ? undefined : t;
  }
  return value;
}

function parseImageUrls({ value }: { value: unknown }): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }
  if (typeof value === 'string') {
    try {
      const p = JSON.parse(value);
      return Array.isArray(p)
        ? p.filter((x): x is string => typeof x === 'string')
        : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export class UpdateEventDto {
  @Transform(trimOrUndefined)
  @IsOptional()
  @IsString()
  title?: string;

  @Transform(trimOrUndefined)
  @IsOptional()
  @IsString()
  description?: string;

  @Transform(trimOrUndefined)
  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  })
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  duration?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  capacity?: number;

  @Transform(trimOrUndefined)
  @IsOptional()
  @IsUUID('4', { message: 'Organizer must be a valid user id' })
  organizerId?: string;

  /** Kept image public URLs (JSON string from multipart or array from JSON body) */
  @IsOptional()
  @Transform(parseImageUrls)
  imageUrls?: string[];
}
