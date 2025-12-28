import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepository: Repository<SaleItem>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Sale[]> {
    return this.saleRepository.find({
      relations: ['store', 'customer', 'employee', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Sale | null> {
    return this.saleRepository.findOne({
      where: { id },
      relations: ['store', 'customer', 'employee', 'items', 'items.product'],
    });
  }

  async create(data: {
    saleNumber: string;
    storeId: number;
    customerId?: number;
    saleDate?: string;
    tax?: number;
    discount?: number;
    paymentMethod: string;
    paymentStatus?: string;
    notes?: string;
    soldBy: number;
    items: Array<{ productId: number; quantity: number; unitPrice: number; discount?: number }>;
  }): Promise<Sale> {
    // Verificar que el número de venta no exista
    const existing = await this.saleRepository.findOne({ where: { saleNumber: data.saleNumber } });
    if (existing) throw new ConflictException(`Sale number '${data.saleNumber}' already exists`);

    // Calcular totales
    let subtotal = 0;
    const itemsData = data.items.map((item) => {
      const itemSubtotal = item.quantity * item.unitPrice - (item.discount || 0);
      subtotal += itemSubtotal;
      return { ...item, subtotal: itemSubtotal };
    });

    const total = subtotal + (data.tax || 0) - (data.discount || 0);

    // Usar transacción para crear venta + items
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear la venta
      const sale = this.saleRepository.create({
        saleNumber: data.saleNumber,
        storeId: data.storeId,
        customerId: data.customerId,
        saleDate: data.saleDate ? new Date(data.saleDate) : new Date(),
        subtotal,
        tax: data.tax || 0,
        discount: data.discount || 0,
        total,
        paymentMethod: data.paymentMethod as any,
        paymentStatus: (data.paymentStatus as any) || 'paid',
        notes: data.notes,
        soldBy: data.soldBy,
      });

      const savedSale = await queryRunner.manager.save(sale) as unknown as Sale;

      // Crear los items
      for (const itemData of itemsData) {
        const item = this.saleItemRepository.create({
          saleId: savedSale.id,
          productId: itemData.productId,
          quantity: itemData.quantity,
          unitPrice: itemData.unitPrice,
          discount: itemData.discount || 0,
          subtotal: itemData.subtotal,
        });
        await queryRunner.manager.save(item);
      }

      await queryRunner.commitTransaction();

      // Recargar con relaciones
      const reloaded = await this.findById(savedSale.id);
      if (!reloaded) throw new NotFoundException('Sale was created but could not be retrieved');
      return reloaded;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    const sale = await this.findById(id);
    if (!sale) throw new NotFoundException('Sale not found');
    await this.saleRepository.delete(id);
  }
}
