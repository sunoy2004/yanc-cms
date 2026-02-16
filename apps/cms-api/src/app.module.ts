import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { DatabaseHealthService } from './common/database-health.service';
import { HealthController } from './common/health.controller';
import { AppController } from './app.controller';
import { MediaModule } from './modules/media/media.module';
import { HeroModule } from './modules/hero/hero.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { EventsModule } from './modules/events/events.module';
import { TeamModule } from './modules/team/team.module';
import { FoundersModule } from './modules/founders/founders.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { AboutModule } from './modules/about/about.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventGalleryItemsModule } from './modules/event-gallery-items/event-gallery-items.module';
import { MentorTalksModule } from './modules/mentor-talks/mentor-talks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    SupabaseModule,
    AuthModule,
    MediaModule,
    HeroModule,
    ProgramsModule,
    EventsModule,
    TeamModule,
    FoundersModule,
    TestimonialsModule,
    AboutModule,
    EventGalleryItemsModule,
    MentorTalksModule,
  ],
  controllers: [AppController, HealthController],
  providers: [DatabaseHealthService],
})
export class AppModule {}