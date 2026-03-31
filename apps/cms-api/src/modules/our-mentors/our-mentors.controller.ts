import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CreateOurMentorDto, UpdateOurMentorDto } from '../../dtos/our-mentor.dto';
import { OurMentorsService } from './our-mentors.service';

@Controller('our-mentors')
export class OurMentorsController {
  constructor(private readonly service: OurMentorsService) {}

  // Public website: only active mentors
  @Get('public')
  @Public()
  async listPublic() {
    return this.service.list(true);
  }

  // CMS/admin: all mentors including drafts
  @Get()
  @Public()
  async listAdmin() {
    return this.service.list(false);
  }

  @Post()
  @Public()
  async create(@Body() dto: CreateOurMentorDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Public()
  async update(@Param('id') id: string, @Body() dto: UpdateOurMentorDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Public()
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

