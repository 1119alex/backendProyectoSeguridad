import { SetMetadata } from '@nestjs/common';

/**
 * Decorador para marcar rutas como públicas (sin autenticación)
 * Uso: @Public()
 */
export const Public = () => SetMetadata('isPublic', true);
