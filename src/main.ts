import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { SanitizeInputPipe } from './common/pipes/sanitize-input.pipe';
import { WinstonLogger } from './common/logger/winston.logger';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const winstonLogger = new WinstonLogger();

  // Crear aplicación con Winston logger
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });

  const configService = app.get(ConfigService);

  // Prefijo global de API
  const apiPrefix = configService.get('app.apiPrefix');
  app.setGlobalPrefix(apiPrefix);

  // Cookie Parser - Required for CSRF and HttpOnly cookies
  app.use(cookieParser());

  // Helmet - Seguridad de headers HTTP con CSP estricto
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline necesario para algunos frameworks
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  logger.log('Security headers configured with strict CSP');

  // CORS - Control de acceso desde otros orígenes
  const corsEnabled = configService.get('cors.enabled');
  if (corsEnabled) {
    app.enableCors({
      origin: configService.get('cors.origin'),
      credentials: configService.get('cors.credentials'),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
      ],
    });
    logger.log('CORS enabled');
  }

  // Pipes de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
      transform: true, // Transforma payloads a instancias de DTO
      transformOptions: {
        enableImplicitConversion: true, // Conversión automática de tipos
      },
      disableErrorMessages: configService.get('app.nodeEnv') === 'production', // Ocultar mensajes en producción
    }),
    new SanitizeInputPipe(), // XSS Protection - Sanitiza todos los inputs
  );

  logger.log('Input sanitization enabled (XSS protection)');

  // Global interceptors (solo en producción para evitar lentitud en desarrollo)
  if (configService.get('app.nodeEnv') === 'production') {
    app.useGlobalInterceptors(new LoggingInterceptor());
    logger.log('Centralized logging enabled (Winston)');
  } else {
    logger.log('Logging interceptor disabled in development (for performance)');
  }

  // Swagger - Documentación de API
  const swaggerEnabled = configService.get('swagger.enabled');
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle(configService.get<string>('swagger.title') || 'API Documentation')
      .setDescription(configService.get<string>('swagger.description') || '')
      .setVersion(configService.get<string>('swagger.version') || '1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'access-token',
      )
      .addTag('Authentication', 'Endpoints de autenticación y autorización')
      .addTag('Users', 'Gestión de usuarios')
      .addTag('Products', 'Gestión de productos')
      .addTag('Inventory', 'Gestión de inventario')
      .addTag('Sales', 'Gestión de ventas')
      .addTag('Purchases', 'Gestión de compras')
      .addTag('Transfers', 'Gestión de transferencias')
      .addTag('Reports', 'Reportes y analíticas')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    const swaggerPath = configService.get('swagger.path');
    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
    });

    logger.log(`Swagger documentation available at: /${swaggerPath}`);
  }

  // Puerto de escucha
  const port = configService.get('app.port');
  await app.listen(port);

  const environment = configService.get('app.nodeEnv');
  logger.log(`Application running in ${environment} mode`);
  logger.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
  if (swaggerEnabled) {
    logger.log(
      `API Documentation: http://localhost:${port}/${configService.get('swagger.path')}`,
    );
  }
}

bootstrap();
