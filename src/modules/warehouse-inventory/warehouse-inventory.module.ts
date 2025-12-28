import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehouseInventoryController } from './warehouse-inventory.controller';
import { WarehouseInventoryService } from './warehouse-inventory.service';
import { WarehouseInventory } from './entities/warehouse-inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WarehouseInventory])],
  controllers: [WarehouseInventoryController],
  providers: [WarehouseInventoryService],
  exports: [WarehouseInventoryService],
})
export class WarehouseInventoryModule {}
