import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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
  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<any> {
    // In production, this should validate against a user database
    // For now, using simple hardcoded credentials for demonstration
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
}