import { Module } from '@nestjs/common';
import { OurMentorsController } from './our-mentors.controller';
import { OurMentorsService } from './our-mentors.service';

@Module({
  controllers: [OurMentorsController],
  providers: [OurMentorsService],
  exports: [OurMentorsService],
})
export class OurMentorsModule {}

