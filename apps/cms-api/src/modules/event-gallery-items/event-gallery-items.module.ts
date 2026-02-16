import { Module } from '@nestjs/common';
import { EventGalleryItemsController } from './event-gallery-items.controller';
import { EventGalleryItemsService } from './event-gallery-items.service';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [EventGalleryItemsController],
  providers: [EventGalleryItemsService],
  exports: [EventGalleryItemsService],
})
export class EventGalleryItemsModule {}