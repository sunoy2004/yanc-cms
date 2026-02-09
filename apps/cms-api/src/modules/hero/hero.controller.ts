import { Controller, Get, Post, Put, Body, Param, Logger } from '@nestjs/common';
import { HeroService } from './hero.service';
import { CreateHeroDto } from '../../dtos/hero.dto';
import { UpdateHeroDto } from '../../dtos/hero-update.dto';

@Controller('hero')
export class HeroController {
  private readonly logger = new Logger(HeroController.name);

  constructor(private heroService: HeroService) {}

  @Get()
  async getHeroContent() {
    this.logger.log('Fetching hero content');
    const content = await this.heroService.getHeroContent();
    
    if (!content) {
      this.logger.warn('No hero content found');
      return {
        id: null,
        title: 'Welcome to YANC CMS',
        subtitle: 'Your content management system is ready',
        ctaText: 'Get Started',
        ctaUrl: '#',
        mediaItems: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return content;
  }

  @Post()
  async createHeroContent(@Body() createHeroDto: CreateHeroDto) {
    this.logger.log('Creating hero content');
    try {
      const content = await this.heroService.createHeroContent(createHeroDto);
      return content;
    } catch (error) {
      this.logger.error('Error creating hero content:', error);
      throw error;
    }
  }

  @Put(':id')
  async updateHeroContent(@Param('id') id: string, @Body() updateHeroDto: UpdateHeroDto) {
    this.logger.log(`Updating hero content with ID: ${id}`);
    try {
      const content = await this.heroService.updateHeroContent(id, updateHeroDto);
      return content;
    } catch (error) {
      this.logger.error('Error updating hero content:', error);
      throw error;
    }
  }
}