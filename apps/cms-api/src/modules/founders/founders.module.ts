import { Module } from '@nestjs/common';
import { FoundersService } from './founders.service';
import { FoundersController } from './founders.controller';
import { SupabaseService } from '../../supabase/supabase.service';

@Module({
  imports: [],
  controllers: [FoundersController],
  providers: [FoundersService, SupabaseService],
  exports: [FoundersService]
})
export class FoundersModule {}