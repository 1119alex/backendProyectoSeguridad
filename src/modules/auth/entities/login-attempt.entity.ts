import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

/**
 * Entidad LoginAttempt - Registro de intentos de login
 * Permite detectar ataques de fuerza bruta y auditar accesos
 */
@Entity('login_attempts')
export class LoginAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  username: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ type: 'boolean' })
  success: boolean;

  @Column({ name: 'failure_reason', type: 'varchar', length: 100, nullable: true })
  failureReason: string | null; // invalid_password, account_locked, mfa_failed, etc.

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
