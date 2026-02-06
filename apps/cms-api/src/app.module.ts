import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { DatabaseHealthService } from './common/database-health.service';
import { HealthController } from './common/health.controller';
import { AppController } from './app.controller';
import { MediaModule } from './modules/media/media.module';
import { GoogleDriveModule } from './google-drive/google-drive.module';
import { HeroModule } from './modules/hero/hero.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    SupabaseModule,
    GoogleDriveModule,
    MediaModule,
    HeroModule,
  ],
  controllers: [AppController, HealthController],
  providers: [DatabaseHealthService],
})
export class AppModule {}