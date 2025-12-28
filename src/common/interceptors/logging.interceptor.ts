import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { WinstonLogger } from '../logger/winston.logger';

/**
 * Logging Interceptor for HTTP requests
 * Logs all incoming requests and their responses
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new WinstonLogger();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, body } = request;
    const user = request.user;
    const now = Date.now();

    // Log incoming request
    this.logger.log(
      `Incoming ${method} ${url}`,
      'HTTP',
    );

    return next.handle().pipe(
      tap((data) => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const delay = Date.now() - now;

        // Log successful response
        this.logger.log(
          `${method} ${url} ${statusCode} - ${delay}ms`,
          'HTTP',
        );

        // Log data access for sensitive operations
        if (user && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          this.logger.dataAccess(
            `User ${user.username} performed ${method} on ${url}`,
            user.id,
            url,
            method,
            { statusCode, delay },
          );
        }
      }),
      catchError((error) => {
        const delay = Date.now() - now;

        // Log error
        this.logger.error(
          `${method} ${url} ${error.status || 500} - ${delay}ms - ${error.message}`,
          error.stack,
          'HTTP',
        );

        // Log failed authorization
        if (error.status === 403 && user) {
          this.logger.authz(
            `Authorization denied for user ${user.username} on ${url}`,
            user.id,
            url,
            method,
            false,
          );
        }

        throw error;
      }),
    );
  }
}
