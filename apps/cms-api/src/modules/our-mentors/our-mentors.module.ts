import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { OurMentorsController } from './our-mentors.controller';
import { OurMentorsService } from './our-mentors.service';

@Module({
  imports: [SupabaseModule],
  controllers: [OurMentorsController],
  providers: [OurMentorsService],
  exports: [OurMentorsService],
})
export class OurMentorsModule {}

