import { Controller, Get, Post, Put, Delete, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from '../../dtos/testimonial.dto';
import { UpdateTestimonialDto } from '../../dtos/testimonial-update.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get('public')
  async getPublicTestimonials() {
    return this.testimonialsService.getTestimonials();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createTestimonial(@Body() createTestimonialDto: CreateTestimonialDto) {
    return this.testimonialsService.createTestimonial(createTestimonialDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateTestimonial(@Param('id') id: string, @Body() updateTestimonialDto: UpdateTestimonialDto) {
    return this.testimonialsService.updateTestimonial(id, updateTestimonialDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteTestimonial(@Param('id') id: string) {
    return this.testimonialsService.deleteTestimonial(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/publish')
  async togglePublish(@Param('id') id: string, @Body('published') published: boolean) {
    const updateDto: UpdateTestimonialDto = { published };
    return this.testimonialsService.updateTestimonial(id, updateDto);
  }
}