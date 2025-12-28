import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Purchase } from './entities/purchase.entity';
import { PurchaseItem } from './entities/purchase-item.entity';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
    @InjectRepository(PurchaseItem)
    private readonly purchaseItemRepository: Repository<PurchaseItem>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Purchase[]> {
    return this.purchaseRepository.find({
      relations: ['supplier', 'creator', 'approver', 'receiver', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Purchase | null> {
    return this.purchaseRepository.findOne({
      where: { id },
      relations: ['supplier', 'creator', 'approver', 'receiver', 'items', 'items.product'],
    });
  }

  async create(data: any): Promise<Purchase> {
    // Validar número de compra único
    const existing = await this.purchaseRepository.findOne({
      where: { purchaseNumber: data.purchaseNumber },
    });
    if (existing) {
      throw new ConflictException(`Purchase number '${data.purchaseNumber}' already exists`);
    }

    // Calcular totales
    let subtotal = 0;
    const itemsData = data.items.map((item: any) => {
      const itemSubtotal = item.quantity * item.unitCost - (item.discount || 0);
      subtotal += itemSubtotal;
      return { ...item, subtotal: itemSubtotal, receivedQuantity: 0 };
    });

    const total = subtotal + (data.tax || 0) - (data.discount || 0) + (data.shippingCost || 0);

    // Transacción
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear compra
      const purchase = this.purchaseRepository.create({
        purchaseNumber: data.purchaseNumber,
        supplierId: data.supplierId,
        purchaseDate: data.purchaseDate,
        expectedDeliveryDate: data.expectedDeliveryDate || null,
        actualDeliveryDate: null,
        subtotal,
        tax: data.tax || 0,
        discount: data.discount || 0,
        shippingCost: data.shippingCost || 0,
        total,
        status: data.status || 'draft',
        notes: data.notes || null,
        createdBy: data.createdBy,
        approvedBy: null,
        receivedBy: null,
      });

      const savedPurchase = (await queryRunner.manager.save(purchase)) as unknown as Purchase;

      // Crear items
      for (const itemData of itemsData) {
        const item = this.purchaseItemRepository.create({
          purchaseId: savedPurchase.id,
          productId: itemData.productId,
          quantityOrdered: itemData.quantity,
          quantityReceived: 0,
          unitCost: itemData.unitCost,
          subtotal: itemData.subtotal,
        });
        await queryRunner.manager.save(item);
      }

      await queryRunner.commitTransaction();

      const reloaded = await this.findById(savedPurchase.id);
      if (!reloaded) {
        throw new NotFoundException('Purchase was created but could not be retrieved');
      }
      return reloaded;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, data: any): Promise<Purchase> {
    const purchase = await this.findById(id);
    if (!purchase) throw new NotFoundException('Purchase not found');

    if (data.purchaseNumber && data.purchaseNumber !== purchase.purchaseNumber) {
      const existing = await this.purchaseRepository.findOne({
        where: { purchaseNumber: data.purchaseNumber },
      });
      if (existing) {
        throw new ConflictException(`Purchase number '${data.purchaseNumber}' already exists`);
      }
    }

    await this.purchaseRepository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new NotFoundException('Purchase not found after update');
    return updated;
  }

  async remove(id: number): Promise<void> {
    const purchase = await this.findById(id);
    if (!purchase) throw new NotFoundException('Purchase not found');
    await this.purchaseRepository.delete(id);
  }
}
