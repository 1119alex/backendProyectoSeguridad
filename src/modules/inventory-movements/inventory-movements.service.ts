import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryMovement, LocationType } from './entities/inventory-movement.entity';

@Injectable()
export class InventoryMovementsService {
  constructor(
    @InjectRepository(InventoryMovement)
    private readonly inventoryMovementRepository: Repository<InventoryMovement>,
  ) {}

  async findAll(): Promise<InventoryMovement[]> {
    return this.inventoryMovementRepository.find({
      relations: ['product', 'creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<InventoryMovement | null> {
    return this.inventoryMovementRepository.findOne({
      where: { id },
      relations: ['product', 'creator'],
    });
  }

  async findByProductId(productId: number): Promise<InventoryMovement[]> {
    return this.inventoryMovementRepository.find({
      where: { productId },
      relations: ['product', 'creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByLocationId(locationId: number, locationType?: LocationType): Promise<InventoryMovement[]> {
    const where: any = { locationId };
    if (locationType) {
      where.locationType = locationType;
    }
    return this.inventoryMovementRepository.find({
      where,
      relations: ['product', 'creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: any): Promise<InventoryMovement> {
    const movement = this.inventoryMovementRepository.create({
      ...data,
      notes: data.notes || null,
      referenceId: data.referenceId || null,
      referenceType: data.referenceType || null,
    });

    const saved = (await this.inventoryMovementRepository.save(movement)) as unknown as InventoryMovement;
    const reloaded = await this.findById(saved.id);
    if (!reloaded) {
      throw new NotFoundException('Movement was created but could not be retrieved');
    }
    return reloaded;
  }

  async update(id: number, data: any): Promise<InventoryMovement> {
    const movement = await this.findById(id);
    if (!movement) throw new NotFoundException('Inventory movement not found');

    await this.inventoryMovementRepository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new NotFoundException('Inventory movement not found after update');
    return updated;
  }

  async remove(id: number): Promise<void> {
    const movement = await this.findById(id);
    if (!movement) throw new NotFoundException('Inventory movement not found');
    await this.inventoryMovementRepository.delete(id);
  }
}
