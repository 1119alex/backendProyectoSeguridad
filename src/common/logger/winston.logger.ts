import { LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

/**
 * Winston Logger Service for centralized logging
 * Logs security events, errors, and application activity
 */
export class WinstonLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    // Define log format
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
        const logObject: any = {
          timestamp,
          level,
          context: context || 'Application',
          message,
          ...meta,
        };
        if (trace) {
          logObject.trace = trace;
        }
        return JSON.stringify(logObject);
      }),
    );

    // Console format for development
    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, context }) => {
        return `${timestamp} [${context || 'App'}] ${level}: ${message}`;
      }),
    );

    // Create transports
    const transports: winston.transport[] = [
      // Console logging
      new winston.transports.Console({
        format: consoleFormat,
      }),

      // Daily rotate file for all logs
      new DailyRotateFile({
        dirname: 'logs',
        filename: 'application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d', // Keep logs for 14 days
        format: logFormat,
      }),

      // Daily rotate file for error logs only
      new DailyRotateFile({
        dirname: 'logs',
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '30d', // Keep error logs for 30 days
        format: logFormat,
      }),

      // Security events log (authentication, authorization, etc.)
      new DailyRotateFile({
        dirname: 'logs',
        filename: 'security-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '90d', // Keep security logs for 90 days
        format: logFormat,
      }),
    ];

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      transports,
      exceptionHandlers: [
        new DailyRotateFile({
          dirname: 'logs',
          filename: 'exceptions-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
        }),
      ],
      rejectionHandlers: [
        new DailyRotateFile({
          dirname: 'logs',
          filename: 'rejections-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { context, trace });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  /**
   * Log security events (login attempts, authorization failures, etc.)
   */
  security(event: string, details: any, userId?: number) {
    this.logger.info(event, {
      context: 'Security',
      userId,
      ...details,
    });
  }

  /**
   * Log authentication events
   */
  auth(event: string, username: string, success: boolean, details?: any) {
    this.logger.info(event, {
      context: 'Authentication',
      username,
      success,
      ...details,
    });
  }

  /**
   * Log authorization events
   */
  authz(event: string, userId: number, resource: string, action: string, granted: boolean) {
    this.logger.info(event, {
      context: 'Authorization',
      userId,
      resource,
      action,
      granted,
    });
  }

  /**
   * Log data access events
   */
  dataAccess(event: string, userId: number, resource: string, operation: string, details?: any) {
    this.logger.info(event, {
      context: 'DataAccess',
      userId,
      resource,
      operation,
      ...details,
    });
  }
}
