import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { TransferItem } from './transfer-item.entity';

export enum LocationType {
  STORE = 'store',
  WAREHOUSE = 'warehouse',
}

export enum TransferStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'transfer_number', type: 'varchar', length: 50, unique: true })
  transferNumber: string;

  @Column({ name: 'from_type', type: 'enum', enum: LocationType })
  fromType: LocationType;

  @Column({ name: 'from_id', type: 'int' })
  fromId: number;

  @Column({ name: 'to_type', type: 'enum', enum: LocationType })
  toType: LocationType;

  @Column({ name: 'to_id', type: 'int' })
  toId: number;

  @Column({ name: 'transfer_date', type: 'timestamp' })
  transferDate: Date;

  @Column({ name: 'expected_arrival_date', type: 'date', nullable: true })
  expectedArrivalDate: Date | null;

  @Column({ name: 'actual_arrival_date', type: 'date', nullable: true })
  actualArrivalDate: Date | null;

  @Column({ type: 'enum', enum: TransferStatus, default: TransferStatus.PENDING })
  status: TransferStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'requested_by', type: 'int' })
  requestedBy: number;

  @ManyToOne(() => Employee, { eager: true })
  @JoinColumn({ name: 'requested_by' })
  requester: Employee;

  @Column({ name: 'approved_by', type: 'int', nullable: true })
  approvedBy: number | null;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: Employee | null;

  @Column({ name: 'received_by', type: 'int', nullable: true })
  receivedBy: number | null;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'received_by' })
  receiver: Employee | null;

  @OneToMany(() => TransferItem, (item) => item.transfer)
  items: TransferItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
