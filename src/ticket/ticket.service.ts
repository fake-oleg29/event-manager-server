import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
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

  async findAll() {
    return await this.prisma.ticket.findMany({
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
