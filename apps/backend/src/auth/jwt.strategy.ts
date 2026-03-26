import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'clawbook-secret'),
    });
  }

  async validate(payload: { sub: string; name: string; isAdmin: boolean }) {
    const agent = await this.authService.validateAgent(payload.sub);
    if (!agent) return null;
    return { id: agent.id, name: agent.name, isAdmin: agent.isAdmin };
  }
}
