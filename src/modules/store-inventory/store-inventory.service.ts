import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreInventory } from './entities/store-inventory.entity';

@Injectable()
export class StoreInventoryService {
  constructor(
    @InjectRepository(StoreInventory)
    private readonly storeInventoryRepository: Repository<StoreInventory>,
  ) {}

  async findAll(): Promise<StoreInventory[]> {
    return this.storeInventoryRepository.find({ relations: ['product', 'store'], order: { createdAt: 'DESC' } });
  }

  async findById(id: number): Promise<StoreInventory | null> {
    return this.storeInventoryRepository.findOne({ where: { id }, relations: ['product', 'store'] });
  }

  async findByStoreId(storeId: number): Promise<StoreInventory[]> {
    return this.storeInventoryRepository.find({ where: { storeId }, relations: ['product', 'store'] });
  }

  async findByProductId(productId: number): Promise<StoreInventory[]> {
    return this.storeInventoryRepository.find({ where: { productId }, relations: ['product', 'store'] });
  }

  async create(data: any): Promise<StoreInventory> {
    const inventory = this.storeInventoryRepository.create({ ...data, quantity: data.quantity || 0, reservedQuantity: 0 });
    const saved = await this.storeInventoryRepository.save(inventory) as unknown as StoreInventory;
    const reloaded = await this.findById(saved.id);
    if (!reloaded) throw new NotFoundException('Inventory was created but could not be retrieved');
    return reloaded;
  }

  async update(id: number, data: any): Promise<StoreInventory> {
    const inventory = await this.findById(id);
    if (!inventory) throw new NotFoundException('Store inventory not found');
    await this.storeInventoryRepository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new NotFoundException('Store inventory not found after update');
    return updated;
  }

  async remove(id: number): Promise<void> {
    const inventory = await this.findById(id);
    if (!inventory) throw new NotFoundException('Store inventory not found');
    await this.storeInventoryRepository.delete(id);
  }
}
