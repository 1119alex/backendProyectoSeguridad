import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseInventory } from './entities/warehouse-inventory.entity';

@Injectable()
export class WarehouseInventoryService {
  constructor(
    @InjectRepository(WarehouseInventory)
    private readonly warehouseInventoryRepository: Repository<WarehouseInventory>,
  ) {}

  async findAll(): Promise<WarehouseInventory[]> {
    return this.warehouseInventoryRepository.find({ relations: ['product', 'warehouse'], order: { createdAt: 'DESC' } });
  }

  async findById(id: number): Promise<WarehouseInventory | null> {
    return this.warehouseInventoryRepository.findOne({ where: { id }, relations: ['product', 'warehouse'] });
  }

  async findByWarehouseId(warehouseId: number): Promise<WarehouseInventory[]> {
    return this.warehouseInventoryRepository.find({ where: { warehouseId }, relations: ['product', 'warehouse'] });
  }

  async findByProductId(productId: number): Promise<WarehouseInventory[]> {
    return this.warehouseInventoryRepository.find({ where: { productId }, relations: ['product', 'warehouse'] });
  }

  async create(data: any): Promise<WarehouseInventory> {
    const inventory = this.warehouseInventoryRepository.create({ ...data, quantity: data.quantity || 0, reservedQuantity: data.reservedQuantity || 0 });
    const saved = (await this.warehouseInventoryRepository.save(inventory)) as unknown as WarehouseInventory;
    const reloaded = await this.findById(saved.id);
    if (!reloaded) throw new NotFoundException('Warehouse inventory was created but could not be retrieved');
    return reloaded;
  }

  async update(id: number, data: any): Promise<WarehouseInventory> {
    const inventory = await this.findById(id);
    if (!inventory) throw new NotFoundException('Warehouse inventory not found');
    await this.warehouseInventoryRepository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new NotFoundException('Warehouse inventory not found after update');
    return updated;
  }

  async remove(id: number): Promise<void> {
    const inventory = await this.findById(id);
    if (!inventory) throw new NotFoundException('Warehouse inventory not found');
    await this.warehouseInventoryRepository.delete(id);
  }
}
