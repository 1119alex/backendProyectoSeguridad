import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

/**
 * Health Controller - Sin prefijo global para Railway
 * Este controlador está excluido del prefijo API para healthchecks
 */
@Controller({ path: 'health' })
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'inventory-backend',
    };
  }
}
