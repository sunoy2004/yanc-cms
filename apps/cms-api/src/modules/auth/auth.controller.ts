import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Get, Put } from '@nestjs/common';
import { AuthService, LoginRequest, LoginResponse } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginRequest: LoginRequest): Promise<LoginResponse> {
    const user = await this.authService.validateUser(
      loginRequest.username,
      loginRequest.password,
    );
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    return this.authService.login(user);
  }
  /**
   * Return current user's profile.
   * Requires a valid JWT.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  getMe(@Req() req: Request) {
    // req.user is set by JwtStrategy.validate
    const user = req.user as any;
    const userId = Number(user?.userId || user?.sub || 1);
    return this.authService.getProfile(userId);
  }

  /**
   * Update current user's profile (name/email)
   */
  @UseGuards(JwtAuthGuard)
  @Put('me')
  @HttpCode(HttpStatus.OK)
  updateMe(@Req() req: Request, @Body() body: { name?: string; email?: string }) {
    const user = req.user as any;
    const userId = Number(user?.userId || user?.sub || 1);
    return this.authService.updateProfile(userId, { name: body.name, email: body.email });
  }

  /**
   * Change password for current user.
   * Body: { currentPassword, newPassword }
   */
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Req() req: Request, @Body() body: { currentPassword: string; newPassword: string }) {
    const user = req.user as any;
    const userId = Number(user?.userId || user?.sub || 1);
    return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
  }
}