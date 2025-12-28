import { Entity, Column, ManyToMany, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

/**
 * Entidad Permission - Permisos granulares del sistema
 * Define acciones específicas como productos:create, inventario:read, etc.
 */
@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string; // Formato: recurso:acción (ej: productos:create)

  @Column({ type: 'varchar', length: 50 })
  resource: string; // productos, inventario, ventas, compras, etc.

  @Column({ type: 'varchar', length: 20 })
  action: string; // create, read, update, delete, list, export

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relaciones
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
