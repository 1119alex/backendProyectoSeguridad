import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum LocationType {
  STORE = 'store',
  WAREHOUSE = 'warehouse',
}

export enum MovementType {
  SALE = 'sale',
  PURCHASE = 'purchase',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  ADJUSTMENT = 'adjustment',
}

@Entity('inventory_movements')
export class InventoryMovement {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'product_id', type: 'int' })
  productId: number;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'location_type', type: 'enum', enum: LocationType })
  locationType: LocationType;

  @Column({ name: 'location_id', type: 'int' })
  locationId: number;

  @Column({ name: 'movement_type', type: 'enum', enum: MovementType })
  movementType: MovementType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'quantity_before', type: 'int' })
  quantityBefore: number;

  @Column({ name: 'quantity_after', type: 'int' })
  quantityAfter: number;

  @Column({ name: 'reference_type', type: 'varchar', length: 50, nullable: true })
  referenceType: string | null;

  @Column({ name: 'reference_id', type: 'int', nullable: true })
  referenceId: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'created_by', type: 'int' })
  createdBy: number;

  @ManyToOne(() => Employee, { eager: true })
  @JoinColumn({ name: 'created_by' })
  creator: Employee;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
