import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // Must never be undefined: passport-jwt throws at init and the API never binds PORT (Cloud Run fails).
    // Keep in sync with JwtModule.register in auth.module.ts. Set JWT_SECRET in production.
    const secretOrKey = process.env.JWT_SECRET || 'your-secret-key';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}