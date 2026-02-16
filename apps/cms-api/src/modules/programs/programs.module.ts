import { Module } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { ProgramsController } from './programs.controller';
import { SupabaseService } from '../../supabase/supabase.service';

@Module({
  imports: [],
  controllers: [ProgramsController],
  providers: [ProgramsService, SupabaseService],
  exports: [ProgramsService]
})
export class ProgramsModule {}