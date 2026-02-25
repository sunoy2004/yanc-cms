import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SupabaseService } from '../../supabase/supabase.service';

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
          .select('id, username, password_hash')
          .eq('username', username)
          .limit(1)
          .maybeSingle();

        if (error) {
          this.logger.error('Supabase error fetching user:', error);
        }

        if (data) {
          const match = await bcrypt.compare(password, (data as any).password_hash || '');
          if (match) {
            return { userId: (data as any).id, username: (data as any).username };
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
      return { userId: 1, username: validUsername };
    }
    return null;
  }

  async login(user: any): Promise<LoginResponse> {
    const payload = { username: user.username, sub: user.userId };
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
      const { data, error } = await client.from('users').select('id, username, name, email').eq('id', userId).maybeSingle();
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
    return { id: userId, username: 'admin', name: data.name, email: data.email };
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
}