import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Buscar permiso por nombre
   */
  async findByName(name: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { name },
    });
  }

  /**
   * Buscar permiso por ID
   */
  async findById(id: number): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { id },
    });
  }

  /**
   * Listar todos los permisos
   */
  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: { resource: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Buscar permisos por recurso
   */
  async findByResource(resource: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { resource },
      order: { name: 'ASC' },
    });
  }
}
