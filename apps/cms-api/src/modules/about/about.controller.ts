import { Controller, Get, Post, Put, Body, Param, Patch } from '@nestjs/common';
import { AboutService } from './about.service';
import { CreateAboutDto } from '../../dtos/about.dto';
import { UpdateAboutDto } from '../../dtos/about-update.dto';

@Controller('about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Get('public')
  async getPublicAbout() {
    return this.aboutService.getAboutContent();
  }

  @Post()
  async createAbout(@Body() createAboutDto: CreateAboutDto) {
    return this.aboutService.createAboutContent(createAboutDto);
  }

  @Put(':id')
  async updateAbout(@Param('id') id: string, @Body() updateAboutDto: UpdateAboutDto) {
    return this.aboutService.updateAboutContent(id, updateAboutDto);
  }

  @Patch(':id/publish')
  async togglePublish(@Param('id') id: string, @Body('published') published: boolean) {
    const updateDto: UpdateAboutDto = { published };
    return this.aboutService.updateAboutContent(id, updateDto);
  }
}