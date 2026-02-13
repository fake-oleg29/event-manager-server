import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  HttpCode,
  Put,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { IEvent } from './interfaces/type';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}
  @Post('create')
  async createEvent(@Body() createEventDto: CreateEventDto): Promise<any> {
    return this.eventService.createEvent(createEventDto);
  }
  @Get('all')
  async getEvents(): Promise<IEvent[]> {
    return this.eventService.getEvents();
  }

  @Get(':id')
  async getEventById(@Param('id') id: string): Promise<IEvent> {
    return this.eventService.findEventById(id);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteEvent(@Param('id') id: string): Promise<void> {
    await this.eventService.deleteEvent(id);
  }

  @Put(':id')
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: CreateEventDto,
  ): Promise<IEvent> {
    return this.eventService.updateEvent(id, updateEventDto);
  }
}
