import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private stats: StatsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getStats() {
    return await this.stats.getStats();
  }
}

