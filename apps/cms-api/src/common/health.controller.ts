import { Controller, Get, Logger } from '@nestjs/common';
import { DatabaseHealthService } from './database-health.service';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private databaseHealthService: DatabaseHealthService) {}

  @Get()
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('db')
  async databaseHealth() {
    const isHealthy = await this.databaseHealthService.isDatabaseHealthy();
    return { 
      database: isHealthy ? 'connected' : 'unavailable',
      timestamp: new Date().toISOString()
    };
  }

  @Get('env')
  environmentCheck() {
    // Return environment configuration (excluding sensitive values)
    const redactedEnv = {
      supabaseUrl: process.env.SUPABASE_URL ? '[SET]' : '[NOT SET]',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY ? '[SET]' : '[NOT SET]',
      supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '[SET]' : '[NOT SET]',
      googleProjectId: process.env.GOOGLE_PROJECT_ID ? '[SET]' : '[NOT SET]',
      googleDriveRootFolder: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ? '[SET]' : '[NOT SET]',
      googleSharedDrive: process.env.GOOGLE_SHARED_DRIVE_ID ? '[SET]' : '[NOT SET]',
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || '3001',
      timestamp: new Date().toISOString()
    };

    return redactedEnv;
  }
}