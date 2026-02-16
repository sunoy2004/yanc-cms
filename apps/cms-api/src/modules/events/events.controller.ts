import { Controller, Get, Post, Put, Delete, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from '../../dtos/event.dto';
import { UpdateEventDto } from '../../dtos/event-update.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('public')
  async getPublicEvents() {
    return this.eventsService.getEvents();
  }

  @Get('upcoming')
  async getUpcomingEvents() {
    const allEvents = await this.eventsService.getEvents();
    const upcomingEvents = allEvents.filter(event => event.category === 'upcoming' && event.is_active);
    // Sort by event_date ascending (soonest upcoming events first)
    return upcomingEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  }

  @Get('past')
  async getPastEvents() {
    const allEvents = await this.eventsService.getEvents();
    return allEvents.filter(event => event.category === 'past' && event.is_active);
  }

  @Get('highlights')
  async getEventHighlights() {
    const allEvents = await this.eventsService.getEvents();
    // Filter for events that have highlights and are active
    return allEvents.filter(event => event.is_active && event.highlights && event.highlights.length > 0);
  }

  // DEPRECATED: Use /api/event-gallery-items/public instead
  @Get('gallery')
  async getEventGalleryDeprecated() {
    return [];
  }

  @Get('by-year/:year')
  async getEventsByYear(@Param('year') year: string) {
    const allEvents = await this.eventsService.getEvents();
    return allEvents.filter(event => event.year === parseInt(year) && event.is_active);
  }

  @Public()
  @Post()
  async createEvent(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.createEvent(createEventDto);
  }

  @Public()
  @Put(':id')
  async updateEvent(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.updateEvent(id, updateEventDto);
  }

  @Public()
  @Delete(':id')
  async deleteEvent(@Param('id') id: string) {
    return this.eventsService.deleteEvent(id);
  }

  @Public()
  @Patch(':id/publish')
  async togglePublish(@Param('id') id: string, @Body('published') published: boolean) {
    const updateDto: UpdateEventDto = { published };
    return this.eventsService.updateEvent(id, updateDto);
  }
}