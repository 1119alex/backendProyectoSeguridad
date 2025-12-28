import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { PasswordHistory } from './entities/password-history.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PasswordHistory)
    private readonly passwordHistoryRepository: Repository<PasswordHistory>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Buscar usuario por username (puede ser username o email)
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ username }, { email: username }],
      relations: ['roles', 'roles.permissions'],
    });
  }

  /**
   * Buscar usuario por ID
   */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
  }

  /**
   * Buscar usuario por UUID
   */
  async findByUuid(uuid: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { uuid },
      relations: ['roles', 'roles.permissions'],
    });
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
  }

  /**
   * Crear nuevo usuario
   */
  async create(userData: Partial<User>, password: string): Promise<User> {
    // Validar si el username ya existe
    const existingUser = await this.userRepository.findOne({
      where: [{ username: userData.username }, { email: userData.email }],
    });

    if (existingUser) {
      if (existingUser.username === userData.username) {
        throw new ConflictException('Username already exists');
      }
      if (existingUser.email === userData.email) {
        throw new ConflictException('Email already exists');
      }
    }

    // Validar política de contraseñas
    await this.validatePasswordPolicy(password);

    // Hash de la contraseña
    const passwordHash = await this.hashPassword(password);

    // Crear usuario
    const user = this.userRepository.create({
      ...userData,
      uuid: uuidv4(),
      passwordHash,
      passwordChangedAt: new Date(),
    });

    const savedUser = await this.userRepository.save(user);

    // Guardar en historial de contraseñas
    await this.savePasswordHistory(savedUser.id, passwordHash);

    return savedUser;
  }

  /**
   * Actualizar usuario
   */
  async update(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new BadRequestException('Invalid current password');
    }

    // Validar nueva contraseña
    await this.validatePasswordPolicy(newPassword);

    // Verificar que no esté en el historial
    await this.checkPasswordHistory(userId, newPassword);

    // Hash de la nueva contraseña
    const newPasswordHash = await this.hashPassword(newPassword);

    // Actualizar usuario
    user.passwordHash = newPasswordHash;
    user.passwordChangedAt = new Date();
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;

    await this.userRepository.save(user);

    // Guardar en historial
    await this.savePasswordHistory(userId, newPasswordHash);
  }

  /**
   * Hash de contraseña con bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const rounds = this.configService.get<number>('bcrypt.rounds') || 10;
    return bcrypt.hash(password, rounds);
  }

  /**
   * Validar contraseña contra hash
   */
  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validar política de contraseñas
   */
  private async validatePasswordPolicy(password: string): Promise<void> {
    const minLength = this.configService.get<number>('passwordPolicy.minLength') || 12;
    const requireUppercase =
      this.configService.get<boolean>('passwordPolicy.requireUppercase') ?? true;
    const requireLowercase =
      this.configService.get<boolean>('passwordPolicy.requireLowercase') ?? true;
    const requireNumbers =
      this.configService.get<boolean>('passwordPolicy.requireNumbers') ?? true;
    const requireSpecialChars =
      this.configService.get<boolean>('passwordPolicy.requireSpecialChars') ?? true;

    if (password.length < minLength) {
      throw new BadRequestException(`Password must be at least ${minLength} characters long`);
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }

    if (requireNumbers && !/\d/.test(password)) {
      throw new BadRequestException('Password must contain at least one number');
    }

    if (requireSpecialChars && !/[@$!%*?&]/.test(password)) {
      throw new BadRequestException('Password must contain at least one special character');
    }
  }

  /**
   * Verificar que la contraseña no esté en el historial
   */
  private async checkPasswordHistory(userId: number, newPassword: string): Promise<void> {
    const historyCount = this.configService.get<number>('passwordPolicy.historyCount') || 6;

    const history = await this.passwordHistoryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: historyCount,
    });

    for (const record of history) {
      const isSame = await bcrypt.compare(newPassword, record.passwordHash);
      if (isSame) {
        throw new BadRequestException(
          `Cannot reuse any of your last ${historyCount} passwords`,
        );
      }
    }
  }

  /**
   * Guardar contraseña en historial
   */
  private async savePasswordHistory(userId: number, passwordHash: string): Promise<void> {
    const historyEntry = this.passwordHistoryRepository.create({
      userId,
      passwordHash,
    });

    await this.passwordHistoryRepository.save(historyEntry);

    // Mantener solo las últimas N contraseñas
    const historyCount = this.configService.get<number>('passwordPolicy.historyCount') || 6;
    const allHistory = await this.passwordHistoryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (allHistory.length > historyCount) {
      const toDelete = allHistory.slice(historyCount);
      await this.passwordHistoryRepository.remove(toDelete);
    }
  }

  /**
   * Registrar intento de login fallido
   */
  async recordFailedLogin(user: User): Promise<void> {
    user.failedLoginAttempts += 1;

    const maxAttempts = this.configService.get<number>('security.maxLoginAttempts') || 5;
    const lockTimeMinutes = this.configService.get<number>('security.accountLockTime') || 15;

    if (user.failedLoginAttempts >= maxAttempts) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + lockTimeMinutes);
      user.lockedUntil = lockUntil;
    }

    await this.userRepository.save(user);
  }

  /**
   * Registrar login exitoso
   */
  async recordSuccessfulLogin(user: User, ipAddress: string): Promise<void> {
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    user.lastLoginIp = ipAddress;

    await this.userRepository.save(user);
  }

  /**
   * Listar todos los usuarios activos
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['roles', 'roles.permissions'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Soft delete de usuario
   */
  async softDelete(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.softDelete(id);
  }
}
