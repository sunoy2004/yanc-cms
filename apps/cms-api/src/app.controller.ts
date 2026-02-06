import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return { 
      status: 'ok',
      message: 'YANC CMS API is running',
      timestamp: new Date().toISOString()
    };
  }
}