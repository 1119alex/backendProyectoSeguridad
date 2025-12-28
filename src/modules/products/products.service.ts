import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({ relations: ['category'], order: { createdAt: 'DESC' } });
  }

  async findById(id: number): Promise<Product | null> {
    return this.productRepository.findOne({ where: { id }, relations: ['category'] });
  }

  async create(data: any): Promise<Product> {
    const existing = await this.productRepository.findOne({ where: { sku: data.sku } });
    if (existing) throw new ConflictException(`Product with SKU '${data.sku}' already exists`);

    const product = this.productRepository.create({ ...data, isActive: true });
    const saved = await this.productRepository.save(product) as unknown as Product;
    const reloaded = await this.findById(saved.id);
    if (!reloaded) throw new NotFoundException('Product was created but could not be retrieved');
    return reloaded;
  }

  async update(id: number, data: any): Promise<Product> {
    const product = await this.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    if (data.sku && data.sku !== product.sku) {
      const existing = await this.productRepository.findOne({ where: { sku: data.sku } });
      if (existing) throw new ConflictException(`Product with SKU '${data.sku}' already exists`);
    }

    await this.productRepository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new NotFoundException('Product not found after update');
    return updated;
  }

  async remove(id: number): Promise<void> {
    const product = await this.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    await this.productRepository.delete(id);
  }
}
