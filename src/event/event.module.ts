import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TicketService } from '../ticket/ticket.service';
import { VenueService } from 'src/venue/venue.service';
import { SupabaseService } from '../supabase/supabase.service';
@Module({
  controllers: [EventController],
  providers: [EventService, TicketService, VenueService, SupabaseService],
})
export class EventModule {}
