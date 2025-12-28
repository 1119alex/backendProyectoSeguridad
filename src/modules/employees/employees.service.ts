import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Listar todos los empleados
   */
  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({
      relations: ['user', 'user.roles'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Buscar empleado por ID
   */
  async findById(id: number): Promise<Employee | null> {
    return this.employeeRepository.findOne({
      where: { id },
      relations: ['user', 'user.roles'],
    });
  }

  /**
   * Buscar empleado por user ID
   */
  async findByUserId(userId: number): Promise<Employee | null> {
    return this.employeeRepository.findOne({
      where: { userId },
      relations: ['user', 'user.roles'],
    });
  }

  /**
   * Crear un nuevo empleado (con su usuario)
   * Usa transacción para asegurar que ambos se creen o ninguno
   */
  async create(data: {
    // Datos del usuario
    username: string;
    email: string;
    password: string;
    roleIds?: number[];
    // Datos del empleado
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    phone?: string;
    address?: string;
    hireDate: string;
    position?: string;
  }): Promise<Employee> {
    // Verificar que el documento no exista
    const existingEmployee = await this.employeeRepository.findOne({
      where: { documentNumber: data.documentNumber },
    });

    if (existingEmployee) {
      throw new ConflictException('An employee with this document number already exists');
    }

    // Usar transacción para crear usuario y empleado
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Crear el usuario
      const user = await this.usersService.create(
        {
          username: data.username,
          email: data.email,
        },
        data.password,
      );

      // 2. Asignar roles si se proporcionaron
      if (data.roleIds && data.roleIds.length > 0) {
        const roles = await this.rolesService.findByIds(data.roleIds);
        user.roles = roles;
        await this.usersService.update(user.id, { roles } as any);
      }

      // 3. Crear el empleado vinculado al usuario
      const employee = this.employeeRepository.create({
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        phone: data.phone,
        address: data.address,
        hireDate: new Date(data.hireDate),
        position: data.position,
        isActive: true,
      });

      const savedEmployee = await queryRunner.manager.save(employee);

      await queryRunner.commitTransaction();

      // Recargar empleado con relaciones
      const reloadedEmployee = await this.findById(savedEmployee.id);

      if (!reloadedEmployee) {
        throw new NotFoundException('Employee was created but could not be retrieved');
      }

      return reloadedEmployee;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Actualizar un empleado (y opcionalmente su usuario)
   */
  async update(
    id: number,
    data: {
      // Datos del usuario
      username?: string;
      email?: string;
      password?: string;
      roleIds?: number[];
      isActive?: boolean;
      // Datos del empleado
      firstName?: string;
      lastName?: string;
      documentType?: string;
      documentNumber?: string;
      phone?: string;
      address?: string;
      hireDate?: string;
      terminationDate?: string;
      position?: string;
    },
  ): Promise<Employee> {
    const employee = await this.findById(id);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Si se está cambiando el número de documento, verificar que no exista
    if (data.documentNumber && data.documentNumber !== employee.documentNumber) {
      const existingEmployee = await this.employeeRepository.findOne({
        where: { documentNumber: data.documentNumber },
      });

      if (existingEmployee) {
        throw new ConflictException('An employee with this document number already exists');
      }
    }

    // Actualizar datos del usuario si se proporcionaron
    if (employee.userId) {
      const userUpdateData: any = {};

      if (data.username) userUpdateData.username = data.username;
      if (data.email) userUpdateData.email = data.email;
      if (data.isActive !== undefined) userUpdateData.isActive = data.isActive;

      // Actualizar contraseña si se proporciona
      if (data.password) {
        const passwordHash = await this.usersService.hashPassword(data.password);
        userUpdateData.passwordHash = passwordHash;
      }

      // Actualizar roles si se proporcionan
      if (data.roleIds !== undefined) {
        if (data.roleIds.length > 0) {
          const roles = await this.rolesService.findByIds(data.roleIds);
          userUpdateData.roles = roles;
        } else {
          userUpdateData.roles = [];
        }
      }

      if (Object.keys(userUpdateData).length > 0) {
        await this.usersService.update(employee.userId, userUpdateData);
      }
    }

    // Actualizar datos del empleado
    const employeeUpdateData: any = {};

    if (data.firstName) employeeUpdateData.firstName = data.firstName;
    if (data.lastName) employeeUpdateData.lastName = data.lastName;
    if (data.documentType) employeeUpdateData.documentType = data.documentType;
    if (data.documentNumber) employeeUpdateData.documentNumber = data.documentNumber;
    if (data.phone !== undefined) employeeUpdateData.phone = data.phone;
    if (data.address !== undefined) employeeUpdateData.address = data.address;
    if (data.hireDate) employeeUpdateData.hireDate = new Date(data.hireDate);
    if (data.terminationDate !== undefined) {
      employeeUpdateData.terminationDate = data.terminationDate ? new Date(data.terminationDate) : null;
    }
    if (data.position !== undefined) employeeUpdateData.position = data.position;

    if (Object.keys(employeeUpdateData).length > 0) {
      await this.employeeRepository.update(id, employeeUpdateData);
    }

    // Recargar empleado con relaciones
    const updatedEmployee = await this.findById(id);

    if (!updatedEmployee) {
      throw new NotFoundException('Employee not found after update');
    }

    return updatedEmployee;
  }

  /**
   * Desactivar un empleado (y su usuario)
   */
  async deactivate(id: number): Promise<void> {
    const employee = await this.findById(id);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Desactivar empleado
    await this.employeeRepository.update(id, { isActive: false });

    // Desactivar usuario si existe
    if (employee.userId) {
      await this.usersService.update(employee.userId, { isActive: false });
    }
  }

  /**
   * Eliminar un empleado (soft delete del usuario)
   */
  async remove(id: number): Promise<void> {
    const employee = await this.findById(id);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Soft delete del usuario
    if (employee.userId) {
      await this.usersService.softDelete(employee.userId);
    }

    // Marcar empleado como inactivo
    await this.employeeRepository.update(id, { isActive: false });
  }
}
