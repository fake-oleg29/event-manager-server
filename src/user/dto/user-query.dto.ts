import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

function trimSearch({ value }: { value: unknown }) {
  if (value === '' || value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return undefined;
  const t = value.trim();
  return t === '' ? undefined : t;
}

export class UserQueryDto {
  /** Case-insensitive partial match on name or email */
  @IsOptional()
  @Transform(trimSearch)
  @IsString()
  @MaxLength(200)
  search?: string;
}
