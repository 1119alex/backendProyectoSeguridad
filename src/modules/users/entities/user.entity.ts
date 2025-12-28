import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Role } from '../../roles/entities/role.entity';
import { Exclude } from 'class-transformer';

/**
 * Entidad User - Usuarios del sistema
 * Implementa seguridad con hash de contraseñas, MFA, bloqueo de cuenta
 */
@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  @Exclude() // No exponer en respuestas JSON
  passwordHash: string;

  // MFA (Multi-Factor Authentication)
  @Column({ name: 'mfa_enabled', type: 'boolean', default: false })
  mfaEnabled: boolean;

  @Column({ name: 'mfa_secret', type: 'varchar', length: 32, nullable: true })
  @Exclude()
  mfaSecret: string | null;

  // Seguridad de sesión
  @Column({ name: 'failed_login_attempts', type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  lockedUntil: Date | null;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  @Column({ name: 'last_login_ip', type: 'varchar', length: 45, nullable: true })
  lastLoginIp: string | null;

  // Seguridad de contraseñas
  @Column({ name: 'password_changed_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  passwordChangedAt: Date;

  // Estado
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Relaciones
  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  // Métodos auxiliares
  get isLocked(): boolean {
    if (!this.lockedUntil) return false;
    return new Date() < this.lockedUntil;
  }

  get needsPasswordChange(): boolean {
    const daysSinceChange = Math.floor(
      (Date.now() - this.passwordChangedAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysSinceChange > 90; // Política: cambiar cada 90 días
  }
}
