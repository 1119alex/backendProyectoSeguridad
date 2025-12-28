import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  /**
   * Listar todas las tiendas
   */
  async findAll(): Promise<Store[]> {
    return this.storeRepository.find({
      relations: ['manager', 'manager.user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Buscar tienda por ID
   */
  async findById(id: number): Promise<Store | null> {
    return this.storeRepository.findOne({
      where: { id },
      relations: ['manager', 'manager.user'],
    });
  }

  /**
   * Buscar tienda por código
   */
  async findByCode(code: string): Promise<Store | null> {
    return this.storeRepository.findOne({
      where: { code },
      relations: ['manager', 'manager.user'],
    });
  }

  /**
   * Crear una nueva tienda
   */
  async create(data: {
    code: string;
    name: string;
    address: string;
    city?: string;
    phone?: string;
    email?: string;
    managerId?: number;
  }): Promise<Store> {
    // Verificar que el código no exista
    const existingStore = await this.storeRepository.findOne({
      where: { code: data.code },
    });

    if (existingStore) {
      throw new ConflictException(`Store with code '${data.code}' already exists`);
    }

    const store = this.storeRepository.create({
      code: data.code,
      name: data.name,
      address: data.address,
      city: data.city,
      phone: data.phone,
      email: data.email,
      managerId: data.managerId,
      isActive: true,
    });

    const savedStore = await this.storeRepository.save(store);

    const reloadedStore = await this.findById(savedStore.id);

    if (!reloadedStore) {
      throw new NotFoundException('Store was created but could not be retrieved');
    }

    return reloadedStore;
  }

  /**
   * Actualizar una tienda
   */
  async update(
    id: number,
    data: {
      code?: string;
      name?: string;
      address?: string;
      city?: string;
      phone?: string;
      email?: string;
      managerId?: number;
      isActive?: boolean;
    },
  ): Promise<Store> {
    const store = await this.findById(id);

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Si se está cambiando el código, verificar que no exista
    if (data.code && data.code !== store.code) {
      const existingStore = await this.storeRepository.findOne({
        where: { code: data.code },
      });

      if (existingStore) {
        throw new ConflictException(`Store with code '${data.code}' already exists`);
      }
    }

    await this.storeRepository.update(id, data);

    const updatedStore = await this.findById(id);

    if (!updatedStore) {
      throw new NotFoundException('Store not found after update');
    }

    return updatedStore;
  }

  /**
   * Desactivar una tienda
   */
  async deactivate(id: number): Promise<void> {
    const store = await this.findById(id);

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    await this.storeRepository.update(id, { isActive: false });
  }

  /**
   * Eliminar una tienda
   */
  async remove(id: number): Promise<void> {
    const store = await this.findById(id);

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    await this.storeRepository.delete(id);
  }
}
