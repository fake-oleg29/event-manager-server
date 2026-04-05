import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
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

  private async assertOrganizerExists(organizerId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: organizerId },
    });
    if (!user) {
      throw new BadRequestException('Organizer not found');
    }
    if (user.role !== Role.Organizer) {
      throw new BadRequestException(
        'The selected user must have the Organizer role',
      );
    }
  }

  async createEvent(
    createEventDto: CreateEventDto,
    files: Express.Multer.File[],
  ): Promise<any> {
    await this.assertOrganizerExists(createEventDto.organizerId);
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

    const uploads = (files ?? []).filter((f) => f?.buffer?.length);
    if (uploads.length > 3) {
      throw new BadRequestException('You can upload at most 3 images');
    }

    const bucket = this.supabase.getClient().storage.from('event-images');
    for (const file of uploads) {
      const safeBase = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${event.id}/${randomUUID()}-${safeBase}`;
      const { error } = await bucket.upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });
      if (error) {
        throw error;
      }
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

  private buildEventWhere(
    query?: EventQueryDto,
  ): Prisma.EventWhereInput | undefined {
    if (!query) return undefined;
    const where: Prisma.EventWhereInput = {};

    const trimmedSearch = query.search?.trim();
    if (trimmedSearch) {
      where.title = {
        contains: trimmedSearch,
        mode: 'insensitive',
      };
    }

    if (query.organizerId) {
      where.organizerId = query.organizerId;
    }
    if (query.venueId) {
      where.venueId = query.venueId;
    }
    if (query.dateFrom || query.dateTo) {
      where.startDate = {};
      if (query.dateFrom) {
        where.startDate.gte = new Date(`${query.dateFrom}T00:00:00.000Z`);
      }
      if (query.dateTo) {
        where.startDate.lte = new Date(`${query.dateTo}T23:59:59.999Z`);
      }
    }
    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      where.price = {};
      if (query.priceMin !== undefined) {
        where.price.gte = new Prisma.Decimal(query.priceMin);
      }
      if (query.priceMax !== undefined) {
        where.price.lte = new Prisma.Decimal(query.priceMax);
      }
    }

    return Object.keys(where).length ? where : undefined;
  }

  async getEvents(query?: EventQueryDto): Promise<IEvent[]> {
    const where = this.buildEventWhere(query);

    const events = await this.prisma.event.findMany({
      where,
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

  private async syncEventImagesAfterUpdate(
    eventId: string,
    keptUrls: string[] | undefined,
    newFiles: Express.Multer.File[],
  ): Promise<void> {
    const bucket = this.supabase.getClient().storage.from('event-images');
    const kept = keptUrls ?? [];

    const { data: existing, error: listErr } = await bucket.list(eventId);
    if (listErr) {
      throw listErr;
    }

    for (const item of existing ?? []) {
      const path = `${eventId}/${item.name}`;
      const { data: pub } = bucket.getPublicUrl(path);
      const publicUrl = pub.publicUrl;
      const stillKept = kept.some(
        (u) =>
          u === publicUrl ||
          u.endsWith(`/${item.name}`) ||
          decodeURI(u).endsWith(`/${item.name}`),
      );
      if (!stillKept) {
        const { error: rmErr } = await bucket.remove([path]);
        if (rmErr) {
          throw rmErr;
        }
      }
    }

    const { data: afterDelete, error: list2Err } = await bucket.list(eventId);
    if (list2Err) {
      throw list2Err;
    }
    const remaining = afterDelete?.length ?? 0;
    const uploads = (newFiles ?? []).filter((f) => f?.buffer?.length);
    const maxNew = Math.max(0, 3 - remaining);
    const toUpload = uploads.slice(0, maxNew);
    for (const file of toUpload) {
      const safeBase = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${eventId}/${randomUUID()}-${safeBase}`;
      const { error } = await bucket.upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });
      if (error) {
        throw error;
      }
    }
  }

  async updateEvent(
    id: string,
    updateEventDto: UpdateEventDto,
    files: Express.Multer.File[] = [],
  ): Promise<any> {
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
    if (updateEventDto.organizerId) {
      await this.assertOrganizerExists(updateEventDto.organizerId);
    }

    const data: Prisma.EventUncheckedUpdateInput = {
      venueId: event.venueId,
    };
    if (updateEventDto.title !== undefined) data.title = updateEventDto.title;
    if (updateEventDto.description !== undefined) {
      data.description = updateEventDto.description;
    }
    if (updateEventDto.startDate !== undefined) {
      data.startDate = updateEventDto.startDate;
    }
    if (updateEventDto.endDate !== undefined) {
      data.endDate = updateEventDto.endDate;
    }
    if (updateEventDto.duration !== undefined) {
      data.duration = updateEventDto.duration;
    }
    if (updateEventDto.price !== undefined) {
      data.price = updateEventDto.price;
    }
    if (updateEventDto.capacity !== undefined) {
      data.capacity = updateEventDto.capacity;
    }
    if (updateEventDto.organizerId !== undefined) {
      data.organizerId = updateEventDto.organizerId;
    }

    await this.prisma.event.update({
      where: { id },
      data,
    });

    const shouldSyncImages =
      updateEventDto.imageUrls !== undefined || (files && files.length > 0);
    if (shouldSyncImages) {
      await this.syncEventImagesAfterUpdate(
        id,
        updateEventDto.imageUrls,
        files ?? [],
      );
    }

    return this.findEventById(id);
  }
}
