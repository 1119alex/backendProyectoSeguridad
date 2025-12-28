import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transfer } from './entities/transfer.entity';
import { TransferItem } from './entities/transfer-item.entity';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(Transfer)
    private readonly transferRepository: Repository<Transfer>,
    @InjectRepository(TransferItem)
    private readonly transferItemRepository: Repository<TransferItem>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Transfer[]> {
    return this.transferRepository.find({
      relations: ['requester', 'approver', 'receiver', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Transfer | null> {
    return this.transferRepository.findOne({
      where: { id },
      relations: ['requester', 'approver', 'receiver', 'items', 'items.product'],
    });
  }

  async create(data: any): Promise<Transfer> {
    // Validar número de transferencia único
    const existing = await this.transferRepository.findOne({
      where: { transferNumber: data.transferNumber },
    });
    if (existing) {
      throw new ConflictException(`Transfer number '${data.transferNumber}' already exists`);
    }

    // Transacción
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear transferencia
      const transfer = this.transferRepository.create({
        transferNumber: data.transferNumber,
        fromType: data.fromType,
        fromId: data.fromId,
        toType: data.toType,
        toId: data.toId,
        transferDate: data.transferDate,
        expectedArrivalDate: data.expectedArrivalDate || null,
        actualArrivalDate: null,
        status: data.status || 'pending',
        notes: data.notes || null,
        requestedBy: data.requestedBy,
        approvedBy: null,
        receivedBy: null,
      });

      const savedTransfer = (await queryRunner.manager.save(transfer)) as unknown as Transfer;

      // Crear items
      for (const itemData of data.items) {
        const item = this.transferItemRepository.create({
          transferId: savedTransfer.id,
          productId: itemData.productId,
          quantityRequested: itemData.quantityRequested,
          quantitySent: 0,
          quantityReceived: 0,
        });
        await queryRunner.manager.save(item);
      }

      await queryRunner.commitTransaction();

      const reloaded = await this.findById(savedTransfer.id);
      if (!reloaded) {
        throw new NotFoundException('Transfer was created but could not be retrieved');
      }
      return reloaded;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, data: any): Promise<Transfer> {
    const transfer = await this.findById(id);
    if (!transfer) throw new NotFoundException('Transfer not found');

    if (data.transferNumber && data.transferNumber !== transfer.transferNumber) {
      const existing = await this.transferRepository.findOne({
        where: { transferNumber: data.transferNumber },
      });
      if (existing) {
        throw new ConflictException(`Transfer number '${data.transferNumber}' already exists`);
      }
    }

    await this.transferRepository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new NotFoundException('Transfer not found after update');
    return updated;
  }

  async remove(id: number): Promise<void> {
    const transfer = await this.findById(id);
    if (!transfer) throw new NotFoundException('Transfer not found');
    await this.transferRepository.delete(id);
  }
}
