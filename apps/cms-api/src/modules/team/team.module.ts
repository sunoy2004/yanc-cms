import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { SupabaseService } from '../../supabase/supabase.service';

@Module({
  imports: [],
  controllers: [TeamController],
  providers: [TeamService, SupabaseService],
  exports: [TeamService]
})
export class TeamModule {}