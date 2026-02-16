import { Module } from '@nestjs/common';
import { MentorTalksService } from './mentor-talks.service';
import { MentorTalksController } from './mentor-talks.controller';
import { SupabaseService } from '../../supabase/supabase.service';

@Module({
  imports: [],
  controllers: [MentorTalksController],
  providers: [MentorTalksService, SupabaseService],
  exports: [MentorTalksService]
})
export class MentorTalksModule {}