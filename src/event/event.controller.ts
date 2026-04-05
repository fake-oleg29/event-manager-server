import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  HttpCode,
  Put,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
import { IEvent } from './interfaces/type';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}
  @Post('')
  @UseInterceptors(FilesInterceptor('files', 3))
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<any> {
    return this.eventService.createEvent(createEventDto, files ?? []);
  }

  @Get('')
  async getEvents(@Query() query: EventQueryDto): Promise<IEvent[]> {
    return this.eventService.getEvents(query);
  }

  @Get(':id')
  async getEventById(@Param('id') id: string): Promise<IEvent> {
    return this.eventService.findEventById(id);
  }

  @Get(':eventId/images')
  async getImages(@Param('eventId') eventId: string) {
    return this.eventService.getEventImages(eventId);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteEvent(@Param('id') id: string): Promise<void> {
    await this.eventService.deleteEvent(id);
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('files', 3))
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<IEvent> {
    return this.eventService.updateEvent(id, updateEventDto, files ?? []);
  }
}
