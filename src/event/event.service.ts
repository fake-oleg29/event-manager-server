import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { IEvent } from './interfaces/type';
import { TicketService } from '../ticket/ticket.service';
import { VenueService } from 'src/venue/venue.service';
import { UpdateEventDto } from './dto/update-event.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { randomUUID } from 'crypto';
@Injectable()
export class EventService {
  private readonly eventWithOrganizer = {
    organizer: {
      select: {
        id: true,
        email: true,
      },
    },
  };

  private readonly eventWithVenue = {
    venue: {
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        zip: true,
        region: true,
        country: true,
      },
    },
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketService: TicketService,
    private readonly venueService: VenueService,
    private readonly supabase: SupabaseService,
  ) {}
  async createEvent(
    createEventDto: CreateEventDto,
    file: Express.Multer.File,
  ): Promise<any> {
    const venue = await this.venueService.createVenue({
      location: createEventDto.venue,
    });
    const event = await this.prisma.event.create({
      data: {
        title: createEventDto.title,
        description: createEventDto.description,
        startDate: createEventDto.startDate,
        endDate: createEventDto.endDate,
        organizerId: createEventDto.organizerId,
        duration: createEventDto.duration,
        price: createEventDto.price,
        capacity: createEventDto.capacity,
        venueId: venue.id,
      },
    });

    const filePath = `${event.id}/${file.originalname}`;

    const { error } = await this.supabase
      .getClient()
      .storage.from('event-images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw error;
    }
  }

  async createImage(
    file: Express.Multer.File,
    eventId: string,
  ): Promise<string> {
    const filePath = `${eventId}/${file.originalname}`;

    const { error } = await this.supabase
      .getClient()
      .storage.from('event-images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw error;
    }

    const { data } = this.supabase
      .getClient()
      .storage.from('event-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async getEvents(): Promise<IEvent[]> {
    const events = await this.prisma.event.findMany({
      include: {
        ...this.eventWithOrganizer,
        ...this.eventWithVenue,
      },
    });

    // optionally, filter out events where organizer is null
    return Promise.all(
      events.map(async (event) => ({
        ...event,
        organizer: event.organizer ?? undefined,
        venue: event.venue ?? undefined,
        tickets: (await this.ticketService.findTicketsByEventId(event.id))
          .length,
        images: await this.getEventImages(event.id),
      })),
    );
  }

  async getEventImages(eventId: string) {
    const { data, error } = await this.supabase
      .getClient()
      .storage.from('event-images')
      .list(eventId);

    if (error) {
      throw error;
    }

    const images = data.map((file) => {
      const { data } = this.supabase
        .getClient()
        .storage.from('event-images')
        .getPublicUrl(`${eventId}/${file.name}`);

      return data.publicUrl;
    });

    return images;
  }

  async findEventById(id: string): Promise<any> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        ...this.eventWithOrganizer,
        ...this.eventWithVenue,
      },
    });
    if (!event) {
      return null;
    }
    return {
      ...event,
      organizer: event.organizer ?? undefined,
      venue: event.venue ?? undefined,
      tickets: (await this.ticketService.findTicketsByEventId(event.id)).length,
      images: await this.getEventImages(event.id),
    };
  }

  async findEventsByOrganizerId(organizerId: string): Promise<IEvent[]> {
    const events = await this.prisma.event.findMany({
      where: { organizerId },
      include: {
        ...this.eventWithOrganizer,
        ...this.eventWithVenue,
      },
    });
    return Promise.all(
      events.map(async (event) => ({
        ...event,
        organizer: event.organizer ?? undefined,
        venue: event.venue ?? undefined,
        tickets: (await this.ticketService.findTicketsByEventId(event.id))
          .length,
        images: await this.getEventImages(event.id),
      })),
    );
  }
  async deleteEvent(id: string): Promise<void> {
    const event = await this.findEventById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    await this.prisma.event.delete({
      where: { id },
    });
  }

  async updateEvent(
    id: string,
    updateEventDto: UpdateEventDto,
  ): Promise<IEvent> {
    console.log('updateEventDto:', updateEventDto);
    const event = await this.findEventById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (updateEventDto.venue) {
      const venue = await this.venueService.findVenueByLocation(
        updateEventDto.venue,
      );
      if (!venue) {
        throw new NotFoundException('Venue not found');
      }

      event.venueId = event.venueId === venue.id ? event.venueId : venue.id;
    }
    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: {
        title: updateEventDto.title,
        description: updateEventDto.description,
        startDate: updateEventDto.startDate,
        duration: updateEventDto.duration,
        price: updateEventDto.price,
        capacity: updateEventDto.capacity,
        organizerId: updateEventDto.organizerId,
        venueId: event.venueId,
      },
    });

    return updatedEvent;
  }
}
