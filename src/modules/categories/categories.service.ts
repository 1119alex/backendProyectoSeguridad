import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Category | null> {
    return this.categoryRepository.findOne({ where: { id } });
  }

  async create(data: {
    name: string;
    description?: string;
  }): Promise<Category> {
    // Validar que el nombre no exista
    const existing = await this.categoryRepository.findOne({
      where: { name: data.name },
    });

    if (existing) {
      throw new ConflictException(`Category with name '${data.name}' already exists`);
    }

    const category = this.categoryRepository.create({
      name: data.name,
      description: data.description,
      isActive: true,
    });

    const saved = await this.categoryRepository.save(category);
    
    const reloaded = await this.findById(saved.id);
    if (!reloaded) {
      throw new NotFoundException('Category was created but could not be retrieved');
    }

    return reloaded;
  }

  async update(id: number, data: {
    name?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<Category> {
    const category = await this.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Validar nombre único si se está cambiando
    if (data.name && data.name !== category.name) {
      const existing = await this.categoryRepository.findOne({
        where: { name: data.name },
      });
      if (existing) {
        throw new ConflictException(`Category with name '${data.name}' already exists`);
      }
    }

    await this.categoryRepository.update(id, data);

    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundException('Category not found after update');
    }

    return updated;
  }

  async remove(id: number): Promise<void> {
    const category = await this.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.categoryRepository.delete(id);
  }
}
