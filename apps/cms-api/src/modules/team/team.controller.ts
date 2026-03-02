import { Controller, Get, Post, Put, Delete, Body, Param, Patch, Query } from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from '../../dtos/team.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('public')
  async getPublicTeamMembers(@Query('section') section?: string) {
    return this.teamService.getTeamMembers(section);
  }

  @Get('public/:type')
  async getPublicTeamMembersByType(@Param('type') type: string) {
    return this.teamService.getTeamMembersByType(type);
  }

  @Public()
  @Post()
  async createTeamMember(@Body() createTeamMemberDto: CreateTeamMemberDto) {
    return this.teamService.createTeamMember(createTeamMemberDto);
  }

  // Keep PUT for backward compatibility
  @Public()
  @Put(':id')
  async updateTeamMemberPut(@Param('id') id: string, @Body() updateTeamMemberDto: UpdateTeamMemberDto) {
    return this.teamService.updateTeamMember(id, updateTeamMemberDto);
  }

  // Preferred for partial updates from CMS
  @Public()
  @Patch(':id')
  async updateTeamMember(@Param('id') id: string, @Body() updateTeamMemberDto: UpdateTeamMemberDto) {
    return this.teamService.updateTeamMember(id, updateTeamMemberDto);
  }

  @Public()
  @Delete(':id')
  async deleteTeamMember(@Param('id') id: string) {
    return this.teamService.deleteTeamMember(id);
  }

  @Public()
  @Patch(':id/publish')
  async togglePublish(@Param('id') id: string, @Body('published') published: boolean) {
    const updateDto: UpdateTeamMemberDto = { published };
    return this.teamService.updateTeamMember(id, updateDto);
  }

  // Admin/CMS view: list team members (including unpublished) by section
  @Get()
  async getAdminTeamMembers(@Query('section') section?: string) {
    return this.teamService.getTeamMembersAdmin(section);
  }
}