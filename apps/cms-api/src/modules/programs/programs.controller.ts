import { Controller, Get, Post, Put, Delete, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from '../../dtos/program.dto';
import { UpdateProgramDto } from '../../dtos/program-update.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAdminPrograms() {
    return this.programsService.getPrograms();
  }

  @Get('public')
  async getPublicPrograms() {
    return this.programsService.getPrograms();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createProgram(@Body() createProgramDto: CreateProgramDto) {
    return this.programsService.createProgram(createProgramDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateProgram(@Param('id') id: string, @Body() updateProgramDto: UpdateProgramDto) {
    return this.programsService.updateProgram(id, updateProgramDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteProgram(@Param('id') id: string) {
    return this.programsService.deleteProgram(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/publish')
  async togglePublish(@Param('id') id: string, @Body('published') published: boolean) {
    const updateDto: UpdateProgramDto = { published };
    return this.programsService.updateProgram(id, updateDto);
  }
}