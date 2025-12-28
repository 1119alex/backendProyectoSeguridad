import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { StoresModule } from './modules/stores/stores.module';
import { CustomersModule } from './modules/customers/customers.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { ProductsModule } from './modules/products/products.module';
import { StoreInventoryModule } from './modules/store-inventory/store-inventory.module';
import { SalesModule } from './modules/sales/sales.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { InventoryMovementsModule } from './modules/inventory-movements/inventory-movements.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { WarehouseInventoryModule } from './modules/warehouse-inventory/warehouse-inventory.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { CategoriesModule } from './modules/categories/categories.module';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    // TypeORM - Base de datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
        timezone: 'Z', // UTC
        charset: 'utf8mb4',
        extra: {
          connectionLimit: configService.get('database.maxConnections'),
        },
        ssl: configService.get('database.ssl'),
      }),
      inject: [ConfigService],
    }),

    // Rate Limiting - Protección contra DDoS/brute force
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('throttle.ttl') || 60000,
            limit: configService.get<number>('throttle.limit') || 100,
          },
        ],
      }),
      inject: [ConfigService],
    }),

    // Módulos funcionales
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    EmployeesModule,
    StoresModule,
    CustomersModule,
    SuppliersModule,
    CategoriesModule,
    ProductsModule,
    StoreInventoryModule,
    SalesModule,
    PurchasesModule,
    InventoryMovementsModule,
    WarehousesModule,
    WarehouseInventoryModule,
    TransfersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guards globales
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
