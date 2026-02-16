import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { MentorTalksService } from './mentor-talks.service';
import { CreateMentorTalkDto } from '../../dtos/mentor-talk.dto';
import { UpdateMentorTalkDto } from '../../dtos/mentor-talk-update.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('mentor-talks')
export class MentorTalksController {
  constructor(private readonly mentorTalksService: MentorTalksService) {}

  @Get('public')
  async getPublicMentorTalks() {
    return this.mentorTalksService.getMentorTalks();
  }

  @Public()
  @Get()
  async getAllMentorTalks() {
    return this.mentorTalksService.getAllMentorTalks();
  }

  @Public()
  @Post()
  async createMentorTalk(@Body() createMentorTalkDto: CreateMentorTalkDto) {
    return this.mentorTalksService.createMentorTalk(createMentorTalkDto);
  }

  @Public()
  @Put(':id')
  async updateMentorTalk(
    @Param('id') id: string,
    @Body() updateMentorTalkDto: UpdateMentorTalkDto,
  ) {
    return this.mentorTalksService.updateMentorTalk(id, updateMentorTalkDto);
  }

  @Public()
  @Delete(':id')
  async deleteMentorTalk(@Param('id') id: string) {
    return this.mentorTalksService.deleteMentorTalk(id);
  }

  @Public()
  @Put(':id/publish')
  async togglePublish(@Param('id') id: string, @Body('published') published: boolean) {
    const updateDto: UpdateMentorTalkDto = { published };
    return this.mentorTalksService.updateMentorTalk(id, updateDto);
  }
}