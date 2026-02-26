import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { SupabaseService } from '../../supabase/supabase.service';

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private jwtService: JwtService, private supabaseService: SupabaseService) {}

  async validateUser(username: string, password: string): Promise<any> {
    // Prefer Supabase-backed users if available
    const client = this.supabaseService.getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('users')
          .select('id, username, password_hash, role')
          .eq('username', username)
          .limit(1)
          .maybeSingle();

        if (error) {
          this.logger.error('Supabase error fetching user:', error);
        }

        if (data) {
          const match = await bcrypt.compare((password as string) || '', (data as any).password_hash || '');
          if (match) {
            return {
              userId: (data as any).id,
              username: (data as any).username,
              role: ((data as any).role as string) || 'admin',
            };
          }
          return null;
        }
      } catch (err) {
        this.logger.error('Error validating user via Supabase:', err);
      }
    }

    // Fallback: simple hardcoded credentials for local/demo use
    const validUsername = 'admin';
    const validPassword = 'yanc-cms-admin';

    if (username === validUsername && password === validPassword) {
      return { userId: 1, username: validUsername, role: 'admin' };
    }
    return null;
  }

  async login(user: any): Promise<LoginResponse> {
    const payload = { username: user.username, sub: user.userId, role: user.role || 'admin' };
    return {
      accessToken: this.jwtService.sign(payload),
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    };
  }
  /**
   * Get profile from Supabase if available, otherwise fallback to minimal demo profile.
   */
  async getProfile(userId: number) {
    const client = this.supabaseService.getClient();
    if (client) {
      const { data, error } = await client
        .from('users')
        .select('id, username, name, email, role')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        this.logger.error('Supabase getProfile error:', error);
      }
      if (data) return data;
    }
    // Fallback
    return {
      id: userId,
      username: 'admin',
      name: 'Admin User',
      email: 'admin@yanc.in',
      role: 'admin',
    };
  }

  async updateProfile(userId: number, data: { name?: string; email?: string }) {
    const client = this.supabaseService.getClient();
    if (client) {
      const { error } = await client.from('users').update({ name: data.name, email: data.email }).eq('id', userId);
      if (error) {
        this.logger.error('Supabase updateProfile error:', error);
        throw new Error('Failed to update profile');
      }
      return this.getProfile(userId);
    }
    // Fallback: return updated fake profile
    return { id: userId, username: 'admin', name: data.name, email: data.email, role: 'admin' };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const client = this.supabaseService.getClient();
    if (client) {
      const { data, error } = await client.from('users').select('password_hash').eq('id', userId).maybeSingle();
      if (error) {
        this.logger.error('Supabase changePassword select error:', error);
        throw new Error('Failed to change password');
      }
      const existingHash = (data as any)?.password_hash || '';
      const match = await bcrypt.compare(currentPassword, existingHash);
      if (!match) {
        throw new Error('Current password is incorrect');
      }
      const newHash = await bcrypt.hash(newPassword, 10);
      const { error: updateError } = await client.from('users').update({ password_hash: newHash }).eq('id', userId);
      if (updateError) {
        this.logger.error('Supabase changePassword update error:', updateError);
        throw new Error('Failed to change password');
      }
      return { success: true };
    }
    // Fallback to in-memory (deprecated)
    throw new Error('Change password not supported without Supabase configured');
  }

  private async ensureAdmin(userId: number): Promise<void> {
    const client = this.supabaseService.getClient();
    if (!client) {
      throw new ForbiddenException('Admin operations require Supabase');
    }
    const { data, error } = await client.from('users').select('role').eq('id', userId).maybeSingle();
    if (error) {
      this.logger.error('Supabase ensureAdmin error:', error);
      throw new ForbiddenException('Unable to verify admin privileges');
    }
    const role = (data as any)?.role || 'editor';
    if (role !== 'admin') {
      throw new ForbiddenException('Only admin can perform this action');
    }
  }

  /**
   * Admin-only: create a new CMS user with auto-generated password.
   * Returns the initial password once so the admin can share it securely.
   */
  async createCmsUser(
    currentUserId: number,
    input: { email: string; name?: string; username?: string },
  ): Promise<{ id: number; email: string; name: string | null; username: string; role: string; initialPassword: string }> {
    const client = this.supabaseService.getClient();
    if (!client) {
      throw new Error('User management requires Supabase');
    }

    await this.ensureAdmin(currentUserId);

    const rawEmail = (input.email || '').trim().toLowerCase();
    if (!rawEmail || !rawEmail.includes('@')) {
      throw new Error('A valid email is required');
    }

    const { data: existingByEmail, error: emailErr } = await client
      .from('users')
      .select('id')
      .eq('email', rawEmail)
      .maybeSingle();
    if (emailErr) {
      this.logger.error('Supabase createCmsUser email check error:', emailErr);
      throw new Error('Failed to create user');
    }
    if (existingByEmail) {
      throw new Error('A user with this email already exists');
    }

    let baseUsername = (input.username || rawEmail.split('@')[0] || 'user').toLowerCase();
    baseUsername = baseUsername.replace(/[^a-z0-9._-]/g, '');
    if (!baseUsername) baseUsername = 'user';

    let finalUsername = baseUsername;
    let suffix = 1;
    // Ensure username is unique
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data: existingUser, error: userErr } = await client
        .from('users')
        .select('id')
        .eq('username', finalUsername)
        .maybeSingle();
      if (userErr) {
        this.logger.error('Supabase createCmsUser username check error:', userErr);
        throw new Error('Failed to create user');
      }
      if (!existingUser) break;
      finalUsername = `${baseUsername}${suffix}`;
      suffix += 1;
    }

    const initialPassword = crypto.randomBytes(12).toString('base64url').slice(0, 12);
    const passwordHash = await bcrypt.hash(initialPassword, 10);

    const name = (input.name || '').trim() || null;

    const { data: created, error: insertErr } = await client
      .from('users')
      .insert({
        username: finalUsername,
        email: rawEmail,
        name,
        password_hash: passwordHash,
        role: 'editor',
        created_by: currentUserId,
      })
      .select('id, email, name, username, role')
      .maybeSingle();

    if (insertErr) {
      this.logger.error('Supabase createCmsUser insert error:', insertErr);
      throw new Error('Failed to create user');
    }

    // Optionally send welcome email with initial password
    try {
      const baseUrl = process.env.FRONTEND_URL || process.env.PASSWORD_RESET_BASE_URL || 'http://localhost:5173';
      const loginUrl = `${baseUrl.replace(/\/$/, '')}/login`;
      await this.sendWelcomeEmail(rawEmail, name || finalUsername, finalUsername, initialPassword, loginUrl);
    } catch (err) {
      // Log but do not fail user creation if email fails
      this.logger.error('Failed to send welcome email:', err);
    }

    return {
      id: (created as any).id,
      email: (created as any).email,
      name: (created as any).name,
      username: (created as any).username,
      role: (created as any).role || 'editor',
      initialPassword,
    };
  }

  /**
   * Admin-only: list users created by the current admin (excluding admins).
   */
  async listCmsUsers(currentUserId: number) {
    const client = this.supabaseService.getClient();
    if (!client) {
      throw new Error('User management requires Supabase');
    }
    await this.ensureAdmin(currentUserId);

    const { data, error } = await client
      .from('users')
      .select('id, email, name, username, role, created_at')
      .eq('created_by', currentUserId)
      .neq('role', 'admin')
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Supabase listCmsUsers error:', error);
      throw new Error('Failed to load users');
    }
    return data || [];
  }

  /**
   * Admin-only: delete a user that was created by the current admin.
   */
  async deleteCmsUser(currentUserId: number, userIdToDelete: number) {
    const client = this.supabaseService.getClient();
    if (!client) {
      throw new Error('User management requires Supabase');
    }
    await this.ensureAdmin(currentUserId);

    const { data: target, error: findErr } = await client
      .from('users')
      .select('id, role, created_by')
      .eq('id', userIdToDelete)
      .maybeSingle();

    if (findErr) {
      this.logger.error('Supabase deleteCmsUser find error:', findErr);
      throw new Error('Failed to delete user');
    }
    if (!target) {
      throw new Error('User not found');
    }
    if ((target as any).role === 'admin') {
      throw new Error('Cannot delete an admin user');
    }
    if ((target as any).created_by !== currentUserId) {
      throw new ForbiddenException('You can only delete users that you created');
    }

    const { error: deleteErr } = await client.from('users').delete().eq('id', userIdToDelete);
    if (deleteErr) {
      this.logger.error('Supabase deleteCmsUser delete error:', deleteErr);
      throw new Error('Failed to delete user');
    }
    return { success: true };
  }

  /**
   * Request password reset: find user by email, set reset token, send email.
   * Always returns the same message for security (no email enumeration).
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const client = this.supabaseService.getClient();
    if (!client) {
      this.logger.warn('Password reset requires Supabase');
      return { message: 'If an account exists with this email, you will receive a reset link shortly.' };
    }
    const { data: user, error: findError } = await client
      .from('users')
      .select('id, email')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();
    if (findError) {
      this.logger.error('Supabase requestPasswordReset select error:', findError);
      return { message: 'If an account exists with this email, you will receive a reset link shortly.' };
    }
    if (!user) {
      return { message: 'If an account exists with this email, you will receive a reset link shortly.' };
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS).toISOString();
    const { error: updateError } = await client
      .from('users')
      .update({ reset_token: token, reset_token_expires_at: expiresAt })
      .eq('id', (user as any).id);
    if (updateError) {
      this.logger.error('Supabase requestPasswordReset update error:', updateError);
      return { message: 'If an account exists with this email, you will receive a reset link shortly.' };
    }
    const baseUrl = process.env.FRONTEND_URL || process.env.PASSWORD_RESET_BASE_URL || 'http://localhost:5173';
    const resetLink = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${token}`;
    await this.sendResetEmail((user as any).email, resetLink);
    return { message: 'If an account exists with this email, you will receive a reset link shortly.' };
  }

  private async sendResetEmail(to: string, resetLink: string): Promise<void> {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) {
      this.logger.warn('SMTP not configured; reset link (dev only): ' + resetLink);
      return;
    }
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || user,
        to,
        subject: 'Reset your YANC CMS password',
        text: `Use this link to reset your password (valid for 1 hour):\n\n${resetLink}\n\nIf you did not request this, you can ignore this email.`,
        html: `<p>Use this link to reset your password (valid for 1 hour):</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, you can ignore this email.</p>`,
      });
    } catch (err) {
      this.logger.error('Failed to send reset email:', err);
    }
  }

  private async sendWelcomeEmail(
    to: string,
    displayName: string,
    username: string,
    password: string,
    loginUrl: string,
  ): Promise<void> {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) {
      this.logger.warn('SMTP not configured; welcome email not sent');
      return;
    }
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      const safeName = displayName || username;
      await transporter.sendMail({
        from: process.env.SMTP_FROM || user,
        to,
        subject: 'Your YANC CMS account',
        text: `Hi ${safeName},

An account has been created for you on the YANC CMS.

Login URL: ${loginUrl}
Username: ${username}
Temporary password: ${password}

For security, please log in and change your password as soon as possible.

If you did not expect this account, you can ignore this email.`,
        html: `<p>Hi ${safeName},</p>
<p>An account has been created for you on the <strong>YANC CMS</strong>.</p>
<p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a><br/>
<strong>Username:</strong> ${username}<br/>
<strong>Temporary password:</strong> ${password}</p>
<p>For security, please log in and change your password as soon as possible.</p>
<p>If you did not expect this account, you can ignore this email.</p>`,
      });
    } catch (err) {
      this.logger.error('Failed to send welcome email:', err);
    }
  }

  /**
   * Reset password using token from email link. Clears token on success.
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const client = this.supabaseService.getClient();
    if (!client) {
      throw new Error('Password reset is not available');
    }
    const now = new Date().toISOString();
    const { data: user, error: findError } = await client
      .from('users')
      .select('id')
      .eq('reset_token', token)
      .gt('reset_token_expires_at', now)
      .maybeSingle();
    if (findError) {
      this.logger.error('Supabase resetPassword select error:', findError);
      throw new Error('Invalid or expired reset link');
    }
    if (!user) {
      throw new Error('Invalid or expired reset link');
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await client
      .from('users')
      .update({
        password_hash: newHash,
        reset_token: null,
        reset_token_expires_at: null,
      })
      .eq('id', (user as any).id);
    if (updateError) {
      this.logger.error('Supabase resetPassword update error:', updateError);
      throw new Error('Failed to reset password');
    }
    return { message: 'Password has been reset. You can now log in with your new password.' };
  }
}