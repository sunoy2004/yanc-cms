import { Module } from '@nestjs/common';
import { AboutService } from './about.service';
import { AboutController } from './about.controller';
import { SupabaseService } from '../../supabase/supabase.service';

@Module({
  imports: [],
  controllers: [AboutController],
  providers: [AboutService, SupabaseService],
  exports: [AboutService]
})
export class AboutModule {}