import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { SupabaseService } from '../../supabase/supabase.service';

@Module({
  imports: [],
  controllers: [EventsController],
  providers: [EventsService, SupabaseService],
  exports: [EventsService]
})
export class EventsModule {}