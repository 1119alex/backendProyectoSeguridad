import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreInventory } from './entities/store-inventory.entity';
import { StoreInventoryService } from './store-inventory.service';
import { StoreInventoryController } from './store-inventory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StoreInventory])],
  controllers: [StoreInventoryController],
  providers: [StoreInventoryService],
  exports: [StoreInventoryService, TypeOrmModule],
})
export class StoreInventoryModule {}
