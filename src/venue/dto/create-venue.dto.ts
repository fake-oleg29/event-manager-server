import { IsString, IsNotEmpty } from 'class-validator';

export class CreateVenueDto {
  @IsString()
  @IsNotEmpty()
  location: string;
}
