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
  UploadedFile,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { IEvent } from './interfaces/type';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    return this.eventService.createEvent(createEventDto, file);
  }

  @Get('')
  async getEvents(): Promise<IEvent[]> {
    return this.eventService.getEvents();
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
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: CreateEventDto,
  ): Promise<IEvent> {
    return this.eventService.updateEvent(id, updateEventDto);
  }
}
