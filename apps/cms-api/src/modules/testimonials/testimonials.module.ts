import { Module } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { TestimonialsController } from './testimonials.controller';
import { SupabaseService } from '../../supabase/supabase.service';

@Module({
  imports: [],
  controllers: [TestimonialsController],
  providers: [TestimonialsService, SupabaseService],
  exports: [TestimonialsService]
})
export class TestimonialsModule {}