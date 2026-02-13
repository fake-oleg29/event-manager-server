import { Controller, Get, Post, Body } from '@nestjs/common';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';

@Controller('venue')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post()
  createVenue(@Body() createVenueDto: CreateVenueDto) {
    return this.venueService.createVenue(createVenueDto);
  }

  @Get()
  findAllVenues() {
    return this.venueService.findAllVenues();
  }
}
