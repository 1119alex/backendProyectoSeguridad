import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Transfer } from './transfer.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('transfer_items')
export class TransferItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'transfer_id', type: 'int' })
  transferId: number;

  @ManyToOne(() => Transfer, (transfer) => transfer.items)
  @JoinColumn({ name: 'transfer_id' })
  transfer: Transfer;

  @Column({ name: 'product_id', type: 'int' })
  productId: number;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'quantity_requested', type: 'int' })
  quantityRequested: number;

  @Column({ name: 'quantity_sent', type: 'int', default: 0 })
  quantitySent: number;

  @Column({ name: 'quantity_received', type: 'int', default: 0 })
  quantityReceived: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
