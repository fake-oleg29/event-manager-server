import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly ticketWithEvent = {
    event: {
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        duration: true,
        price: true,
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            zip: true,
          },
        },
      },
    },
  };

  async create(createTicketDto: CreateTicketDto) {
    return await this.prisma.ticket.create({
      data: createTicketDto,
    });
  }

  private buildTicketWhere(
    query?: TicketQueryDto,
  ): Prisma.TicketWhereInput | undefined {
    const s = query?.search?.trim();
    if (!s) return undefined;
    return {
      OR: [
        { seatNumber: { contains: s, mode: 'insensitive' } },
        {
          event: {
            title: { contains: s, mode: 'insensitive' },
          },
        },
      ],
    };
  }

  async findAll(query?: TicketQueryDto) {
    const where = this.buildTicketWhere(query);
    return await this.prisma.ticket.findMany({
      where,
      include: {
        ...this.ticketWithEvent,
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        ...this.ticketWithEvent,
      },
    });
  }

  async findTicketsByEventId(eventId: string) {
    return await this.prisma.ticket.findMany({
      where: { eventId },
      include: {
        ...this.ticketWithEvent,
      },
    });
  }

  async update(id: string, updateTicketDto: UpdateTicketDto) {
    return await this.prisma.ticket.update({
      where: { id },
      data: updateTicketDto,
    });
  }
}
