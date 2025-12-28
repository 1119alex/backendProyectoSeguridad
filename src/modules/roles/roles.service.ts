import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Buscar rol por nombre
   */
  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }

  /**
   * Buscar rol por ID
   */
  async findById(id: number): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  /**
   * Listar todos los roles (no eliminados)
   */
  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Buscar roles por IDs
   */
  async findByIds(ids: number[]): Promise<Role[]> {
    return this.roleRepository.find({
      where: ids.map(id => ({ id })),
      relations: ['permissions'],
    });
  }

  /**
   * Crear un nuevo rol
   */
  async create(
    data: { name: string; displayName: string; description?: string },
    permissionIds?: number[],
  ): Promise<Role> {
    // Verificar si el nombre ya existe
    const existingRole = await this.roleRepository.findOne({
      where: { name: data.name },
    });

    if (existingRole) {
      throw new ConflictException(`Role with name '${data.name}' already exists`);
    }

    // Crear el rol
    const role = this.roleRepository.create({
      ...data,
      uuid: uuidv4(),
    });

    // Asignar permisos si se proporcionaron
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await this.permissionRepository.find({
        where: permissionIds.map(id => ({ id })),
      });
      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
  }

  /**
   * Actualizar un rol
   */
  async update(
    id: number,
    data: { name?: string; displayName?: string; description?: string },
    permissionIds?: number[],
  ): Promise<Role> {
    const role = await this.findById(id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Si se está cambiando el nombre, verificar que no exista otro rol con ese nombre
    if (data.name && data.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: data.name },
      });

      if (existingRole) {
        throw new ConflictException(`Role with name '${data.name}' already exists`);
      }
    }

    // Actualizar datos básicos
    Object.assign(role, data);

    // Actualizar permisos si se proporcionaron
    if (permissionIds !== undefined) {
      if (permissionIds.length > 0) {
        const permissions = await this.permissionRepository.find({
          where: permissionIds.map(id => ({ id })),
        });
        role.permissions = permissions;
      } else {
        role.permissions = [];
      }
    }

    return this.roleRepository.save(role);
  }

  /**
   * Eliminar un rol (soft delete)
   */
  async softDelete(id: number): Promise<void> {
    const role = await this.findById(id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.roleRepository.softDelete(id);
  }
}
