import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DatabaseHealthService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseHealthService.name);

  constructor(private supabase: SupabaseService) {}

  async onModuleInit() {
    await this.validateDatabaseConnection();
  }

  private async validateDatabaseConnection(): Promise<void> {
    try {
      this.logger.log('Validating database connection...');
      
      // Test the connection with Supabase health check
      const isHealthy = await this.supabase.healthCheck();
      
      if (isHealthy) {
        this.logger.log('✅ Database connection validated successfully');
      } else {
        throw new Error('Supabase health check failed');
      }
    } catch (error) {
      this.logger.error('❌ Database connection validation failed:', error);
      this.logger.error('SUPABASE_URL:', process.env.SUPABASE_URL?.substring(0, 50) + '...');
      this.logger.warn('⚠️  Application will start in degraded mode - database operations may fail');
      // Don't throw error - allow application to start
    }
  }

  async isDatabaseHealthy(): Promise<boolean> {
    try {
      return await this.supabase.healthCheck();
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return false;
    }
  }
}