import { SetMetadata } from '@nestjs/common';

/**
 * Decorador para requerir roles específicos
 * Uso: @Roles('admin', 'manager')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
