import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller('activity')
export class ActivityController {
  constructor(private activity: ActivityService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async recent(@Query('limit') limit = '10') {
    const n = Number(limit) || 10;
    return await this.activity.getRecent(n);
  }
}

