import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TicketService } from '../ticket/ticket.service';
import { VenueService } from 'src/venue/venue.service';
@Module({
  controllers: [EventController],
  providers: [EventService, TicketService, VenueService],
})
export class EventModule {}
