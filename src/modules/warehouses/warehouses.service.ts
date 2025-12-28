import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  async findAll(): Promise<Warehouse[]> {
    return this.warehouseRepository.find({ relations: ['manager'], order: { createdAt: 'DESC' } });
  }

  async findById(id: number): Promise<Warehouse | null> {
    return this.warehouseRepository.findOne({ where: { id }, relations: ['manager'] });
  }

  async create(data: any): Promise<Warehouse> {
    const existing = await this.warehouseRepository.findOne({ where: { code: data.code } });
    if (existing) throw new ConflictException(`Warehouse with code '${data.code}' already exists`);

    const warehouse = this.warehouseRepository.create({ ...data, isActive: true });
    const saved = (await this.warehouseRepository.save(warehouse)) as unknown as Warehouse;
    const reloaded = await this.findById(saved.id);
    if (!reloaded) throw new NotFoundException('Warehouse was created but could not be retrieved');
    return reloaded;
  }

  async update(id: number, data: any): Promise<Warehouse> {
    const warehouse = await this.findById(id);
    if (!warehouse) throw new NotFoundException('Warehouse not found');

    if (data.code && data.code !== warehouse.code) {
      const existing = await this.warehouseRepository.findOne({ where: { code: data.code } });
      if (existing) throw new ConflictException(`Warehouse with code '${data.code}' already exists`);
    }

    await this.warehouseRepository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new NotFoundException('Warehouse not found after update');
    return updated;
  }

  async remove(id: number): Promise<void> {
    const warehouse = await this.findById(id);
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    await this.warehouseRepository.delete(id);
  }
}
