import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
enum Role {
  Admin = 'Admin',
  Client = 'Client',
  Organizer = 'Organizer',
}
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  password: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
