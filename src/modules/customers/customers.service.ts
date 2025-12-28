import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  /**
   * Listar todos los clientes
   */
  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Buscar cliente por ID
   */
  async findById(id: number): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { id } });
  }

  /**
   * Buscar cliente por código
   */
  async findByCode(code: string): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { code } });
  }

  /**
   * Buscar cliente por número de documento
   */
  async findByDocumentNumber(documentNumber: string): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { documentNumber } });
  }

  /**
   * Crear un nuevo cliente
   */
  async create(data: {
    code: string;
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    customerType?: 'individual' | 'business';
    taxId?: string;
  }): Promise<Customer> {
    // Verificar que el código no exista
    const existingCode = await this.customerRepository.findOne({
      where: { code: data.code },
    });

    if (existingCode) {
      throw new ConflictException(`Customer with code '${data.code}' already exists`);
    }

    // Verificar que el número de documento no exista
    const existingDocument = await this.customerRepository.findOne({
      where: { documentNumber: data.documentNumber },
    });

    if (existingDocument) {
      throw new ConflictException(`Customer with document number '${data.documentNumber}' already exists`);
    }

    const customer = this.customerRepository.create({
      code: data.code,
      firstName: data.firstName,
      lastName: data.lastName,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      customerType: data.customerType || 'individual',
      taxId: data.taxId,
      isActive: true,
    });

    const saved = await this.customerRepository.save(customer);

    const reloaded = await this.findById(saved.id);
    if (!reloaded) {
      throw new NotFoundException('Customer was created but could not be retrieved');
    }

    return reloaded;
  }

  /**
   * Actualizar un cliente
   */
  async update(
    id: number,
    data: {
      code?: string;
      firstName?: string;
      lastName?: string;
      documentType?: string;
      documentNumber?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
      customerType?: 'individual' | 'business';
      taxId?: string;
      isActive?: boolean;
    },
  ): Promise<Customer> {
    const customer = await this.findById(id);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Validar código único si se está cambiando
    if (data.code && data.code !== customer.code) {
      const existing = await this.customerRepository.findOne({
        where: { code: data.code },
      });
      if (existing) {
        throw new ConflictException(`Customer with code '${data.code}' already exists`);
      }
    }

    // Validar documento único si se está cambiando
    if (data.documentNumber && data.documentNumber !== customer.documentNumber) {
      const existing = await this.customerRepository.findOne({
        where: { documentNumber: data.documentNumber },
      });
      if (existing) {
        throw new ConflictException(`Customer with document number '${data.documentNumber}' already exists`);
      }
    }

    await this.customerRepository.update(id, data);

    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundException('Customer not found after update');
    }

    return updated;
  }

  /**
   * Desactivar un cliente
   */
  async deactivate(id: number): Promise<void> {
    const customer = await this.findById(id);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.customerRepository.update(id, { isActive: false });
  }

  /**
   * Eliminar un cliente
   */
  async remove(id: number): Promise<void> {
    const customer = await this.findById(id);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.customerRepository.delete(id);
  }
}
