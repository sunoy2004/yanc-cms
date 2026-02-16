import { Controller, Get, Post, Put, Delete, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { EventGalleryItemsService } from './event-gallery-items.service';
import { CreateEventGalleryItemDto } from '../../dtos/event-gallery-item.dto';
import { UpdateEventGalleryItemDto } from '../../dtos/event-gallery-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('event-gallery-items')
export class EventGalleryItemsController {
  constructor(private readonly eventGalleryItemsService: EventGalleryItemsService) {}

  @Get('public')
  @Public()
  async getPublicEventGalleryItems() {
    return this.eventGalleryItemsService.getEventGalleryItems();
  }

  @Post()
  @Public()
  async createEventGalleryItem(@Body() createDto: CreateEventGalleryItemDto) {
    return this.eventGalleryItemsService.createEventGalleryItem(createDto);
  }

  @Put(':id')
  @Public()
  async updateEventGalleryItem(
    @Param('id') id: string,
    @Body() updateDto: UpdateEventGalleryItemDto
  ) {
    return this.eventGalleryItemsService.updateEventGalleryItem(id, updateDto);
  }

  @Delete(':id')
  @Public()
  async deleteEventGalleryItem(@Param('id') id: string) {
    return this.eventGalleryItemsService.deleteEventGalleryItem(id);
  }

  @Patch(':id/publish')
  @Public()
  async togglePublish(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean
  ) {
    return this.eventGalleryItemsService.togglePublish(id, isActive);
  }
}