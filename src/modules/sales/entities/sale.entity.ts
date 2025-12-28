import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Store } from '../../stores/entities/store.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { SaleItem } from './sale-item.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sale_number', type: 'varchar', length: 50, unique: true })
  saleNumber: string;

  @Column({ name: 'store_id', type: 'int' })
  storeId: number;

  @ManyToOne(() => Store, { eager: true })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ name: 'customer_id', type: 'int', nullable: true })
  customerId: number | null;

  @ManyToOne(() => Customer, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer | null;

  @Column({ name: 'sale_date', type: 'timestamp' })
  saleDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ name: 'payment_method', type: 'enum', enum: ['cash', 'card', 'transfer', 'credit'] })
  paymentMethod: 'cash' | 'card' | 'transfer' | 'credit';

  @Column({ name: 'payment_status', type: 'enum', enum: ['pending', 'partial', 'paid', 'cancelled'], default: 'paid' })
  paymentStatus: 'pending' | 'partial' | 'paid' | 'cancelled';

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'sold_by', type: 'int' })
  soldBy: number;

  @ManyToOne(() => Employee, { eager: true })
  @JoinColumn({ name: 'sold_by' })
  employee: Employee;

  @OneToMany(() => SaleItem, (item) => item.sale, { eager: true })
  items: SaleItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
