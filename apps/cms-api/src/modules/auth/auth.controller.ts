import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Get,
  Put,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService, LoginRequest, LoginResponse } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginRequest: LoginRequest): Promise<LoginResponse> {
    const user = await this.authService.validateUser(
      loginRequest.username,
      loginRequest.password,
    );
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
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
    try {
      return this.authService.getProfile(userId);
    } catch (err) {
      this.logger.error('Error fetching profile', err);
      throw new InternalServerErrorException('Failed to fetch profile');
    }
  }

  /**
   * Update current user's profile (name/email/username)
   */
  @UseGuards(JwtAuthGuard)
  @Put('me')
  @HttpCode(HttpStatus.OK)
  updateMe(@Req() req: Request, @Body() body: { name?: string; email?: string; username?: string }) {
    const user = req.user as any;
    const userId = Number(user?.userId || user?.sub || 1);
    try {
      return this.authService.updateProfile(userId, { name: body.name, email: body.email, username: body.username });
    } catch (err) {
      this.logger.error('Error updating profile', err);
      throw new InternalServerErrorException('Failed to update profile');
    }
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
    if (!body?.currentPassword || !body?.newPassword) {
      throw new BadRequestException('currentPassword and newPassword are required');
    }

    try {
      return await this.authService.changePassword(userId, body.currentPassword, body.newPassword);
    } catch (err: any) {
      this.logger.error('Error changing password', err?.message || err);
      if (err.message && err.message.includes('Current password is incorrect')) {
        throw new UnauthorizedException('Current password is incorrect');
      }
      throw new InternalServerErrorException(err?.message || 'Failed to change password');
    }
  }

  /**
   * Admin-only: create a new CMS user with an auto-generated initial password.
   * Body: { email, name?, username? }
   */
  @UseGuards(JwtAuthGuard)
  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Req() req: Request,
    @Body()
    body: {
      email?: string;
      name?: string;
      username?: string;
    },
  ) {
    const current = req.user as any;
    const userId = Number(current?.userId || current?.sub || 1);
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    if (!email) {
      throw new BadRequestException('email is required');
    }
    try {
      const created = await this.authService.createCmsUser(userId, {
        email,
        name: body?.name,
        username: body?.username,
      });
      return created;
    } catch (err: any) {
      this.logger.error('Error creating CMS user', err?.message || err);
      if (err instanceof ForbiddenException) {
        throw err;
      }
      if (typeof err?.message === 'string' && err.message.includes('already exists')) {
        throw new BadRequestException(err.message);
      }
      throw new InternalServerErrorException(err?.message || 'Failed to create user');
    }
  }

  /**
   * Admin-only: list CMS users created by the current admin.
   */
  @UseGuards(JwtAuthGuard)
  @Get('users')
  @HttpCode(HttpStatus.OK)
  async listUsers(@Req() req: Request) {
    const current = req.user as any;
    const userId = Number(current?.userId || current?.sub || 1);
    try {
      return await this.authService.listCmsUsers(userId);
    } catch (err: any) {
      this.logger.error('Error listing CMS users', err?.message || err);
      if (err instanceof ForbiddenException) {
        throw err;
      }
      throw new InternalServerErrorException(err?.message || 'Failed to load users');
    }
  }

  /**
   * Admin-only: delete a CMS user created by the current admin.
   */
  @UseGuards(JwtAuthGuard)
  @Post('users/delete')
  @HttpCode(HttpStatus.OK)
  async deleteUser(
    @Req() req: Request,
    @Body()
    body: {
      userId?: number;
    },
  ) {
    const current = req.user as any;
    const currentUserId = Number(current?.userId || current?.sub || 1);
    const userIdToDelete = Number(body?.userId || 0);
    if (!userIdToDelete || Number.isNaN(userIdToDelete)) {
      throw new BadRequestException('userId is required');
    }
    try {
      return await this.authService.deleteCmsUser(currentUserId, userIdToDelete);
    } catch (err: any) {
      this.logger.error('Error deleting CMS user', err?.message || err);
      if (err instanceof ForbiddenException) {
        throw err;
      }
      if (typeof err?.message === 'string' && (err.message.includes('not found') || err.message.includes('Cannot delete'))) {
        throw new BadRequestException(err.message);
      }
      throw new InternalServerErrorException(err?.message || 'Failed to delete user');
    }
  }

  /**
   * Request password reset. Sends email with reset link if user exists.
   * Body: { email }
   */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: { email?: string }): Promise<{ message: string }> {
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    if (!email) {
      throw new BadRequestException('email is required');
    }
    return this.authService.requestPasswordReset(email);
  }

  /**
   * Reset password using token from email link.
   * Body: { token, newPassword }
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: { token?: string; newPassword?: string }): Promise<{ message: string }> {
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';
    if (!token || !newPassword) {
      throw new BadRequestException('token and newPassword are required');
    }
    if (newPassword.length < 8) {
      throw new BadRequestException('newPassword must be at least 8 characters');
    }
    try {
      return await this.authService.resetPassword(token, newPassword);
    } catch (err: any) {
      if (err.message && (err.message.includes('Invalid or expired') || err.message.includes('not available'))) {
        throw new BadRequestException(err.message);
      }
      throw new InternalServerErrorException(err?.message || 'Failed to reset password');
    }
  }
}