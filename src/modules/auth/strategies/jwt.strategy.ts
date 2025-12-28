import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import type { Request } from 'express';

/**
 * Estrategia JWT para validar access tokens
 * Soporta tokens desde Authorization header Y desde HttpOnly cookies
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. Intentar extraer de cookie primero (más seguro)
        (request: Request) => {
          return request?.cookies?.accessToken;
        },
        // 2. Fallback a Authorization header (para compatibilidad con API clients)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'dev_secret_key_change_in_production_12345678',
    });
  }

  /**
   * Validar payload del JWT y retornar usuario
   */
  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid token');
    }

    // Verificar si la cuenta está bloqueada
    if (user.isLocked) {
      throw new UnauthorizedException('Account is locked');
    }

    // Retornar datos del usuario que se agregarán a request.user
    return {
      id: user.id,
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
    };
  }
}
