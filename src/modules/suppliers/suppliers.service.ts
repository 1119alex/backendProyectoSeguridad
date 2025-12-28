import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async findAll(): Promise<Supplier[]> {
    return this.supplierRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: number): Promise<Supplier | null> {
    return this.supplierRepository.findOne({ where: { id } });
  }

  async create(data: {
    code: string;
    businessName: string;
    taxId: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    paymentTerms?: string;
  }): Promise<Supplier> {
    const existing = await this.supplierRepository.findOne({ where: { code: data.code } });
    if (existing) {
      throw new ConflictException(`Supplier with code '${data.code}' already exists`);
    }

    const supplier = this.supplierRepository.create({ ...data, isActive: true });
    const saved = await this.supplierRepository.save(supplier);
    const reloaded = await this.findById(saved.id);
    if (!reloaded) throw new NotFoundException('Supplier was created but could not be retrieved');
    return reloaded;
  }

  async update(id: number, data: Partial<Supplier>): Promise<Supplier> {
    const supplier = await this.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    if (data.code && data.code !== supplier.code) {
      const existing = await this.supplierRepository.findOne({ where: { code: data.code } });
      if (existing) throw new ConflictException(`Supplier with code '${data.code}' already exists`);
    }

    await this.supplierRepository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new NotFoundException('Supplier not found after update');
    return updated;
  }

  async remove(id: number): Promise<void> {
    const supplier = await this.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');
    await this.supplierRepository.delete(id);
  }
}
