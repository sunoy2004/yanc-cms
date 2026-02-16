import { Controller, Get, Post, Put, Delete, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { FoundersService } from './founders.service';
import { CreateFounderDto } from '../../dtos/founder.dto';
import { UpdateFounderDto } from '../../dtos/founder-update.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('founders')
export class FoundersController {
  constructor(private readonly foundersService: FoundersService) {}

  @Get('public')
  async getPublicFounders() {
    return this.foundersService.getFounders();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createFounder(@Body() createFounderDto: CreateFounderDto) {
    return this.foundersService.createFounder(createFounderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateFounder(@Param('id') id: string, @Body() updateFounderDto: UpdateFounderDto) {
    return this.foundersService.updateFounder(id, updateFounderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteFounder(@Param('id') id: string) {
    return this.foundersService.deleteFounder(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/publish')
  async togglePublish(@Param('id') id: string, @Body('published') published: boolean) {
    const updateDto: UpdateFounderDto = { published };
    return this.foundersService.updateFounder(id, updateDto);
  }
}