import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import * as crypto from 'crypto';

/**
 * CSRF Protection using Double Submit Cookie pattern
 * https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Skip CSRF check for routes marked as @Public() or GET/HEAD/OPTIONS
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    const request = context.switchToHttp().getRequest<Request>();

    // CSRF protection only applies to state-changing methods
    if (isPublic || ['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    // Get CSRF token from cookie and header
    const csrfCookie = request.cookies?.['csrf-token'];
    const csrfHeader = request.headers['x-csrf-token'] as string;

    // Both must exist and match
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}

/**
 * Generate a secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
