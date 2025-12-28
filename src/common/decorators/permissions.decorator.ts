import { SetMetadata } from '@nestjs/common';

/**
 * Decorador para requerir permisos específicos
 * Uso: @RequirePermissions('users:create', 'users:update')
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);
