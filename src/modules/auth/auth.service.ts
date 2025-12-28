import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginAttempt } from './entities/login-attempt.entity';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(LoginAttempt)
    private readonly loginAttemptRepository: Repository<LoginAttempt>,
  ) {}

  /**
   * Login de usuario
   */
  async login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<LoginResponseDto | { requiresMfa: boolean; message: string }> {
    const { username, password, mfaToken } = loginDto;

    // Buscar usuario
    const user = await this.usersService.findByUsername(username);

    // Registrar intento de login
    await this.recordLoginAttempt(user?.id || null, username, ipAddress, userAgent, false, null);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar si la cuenta está bloqueada
    if (user.isLocked && user.lockedUntil) {
      const lockMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(
        `Account is locked. Try again in ${lockMinutes} minutes`,
      );
    }

    // Verificar si la cuenta está activa
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Validar contraseña
    const isValidPassword = await this.usersService.validatePassword(password, user.passwordHash);
    if (!isValidPassword) {
      await this.usersService.recordFailedLogin(user);
      await this.recordLoginAttempt(
        user.id,
        username,
        ipAddress,
        userAgent,
        false,
        'invalid_credentials',
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar si la contraseña ha expirado (90 días)
    if (user.needsPasswordChange) {
      await this.recordLoginAttempt(
        user.id,
        username,
        ipAddress,
        userAgent,
        false,
        'password_expired',
      );
      throw new UnauthorizedException(
        'Password has expired. Please reset your password.',
      );
    }

    // Verificar MFA si está habilitado
    if (user.mfaEnabled) {
      if (!mfaToken) {
        return {
          requiresMfa: true,
          message: 'MFA token required',
        };
      }

      const isMfaValid = this.verifyMfaToken(user.mfaSecret || '', mfaToken);
      if (!isMfaValid) {
        await this.recordLoginAttempt(user.id, username, ipAddress, userAgent, false, 'mfa_failed');
        throw new UnauthorizedException('Invalid MFA token');
      }
    }

    // Login exitoso
    await this.usersService.recordSuccessfulLogin(user, ipAddress);
    await this.recordLoginAttempt(user.id, username, ipAddress, userAgent, true, null, user.mfaEnabled);

    // Generar tokens
    const tokens = await this.generateTokens(user, ipAddress, userAgent);

    return {
      ...tokens,
      user: {
        id: user.id,
        uuid: user.uuid,
        username: user.username,
        email: user.email,
        roles: user.roles.map((role) => ({
          id: role.id,
          name: role.name,
          displayName: role.displayName,
          permissions: role.permissions.map((p) => ({
            id: p.id,
            name: p.name,
            resource: p.resource,
            action: p.action,
          })),
        })),
        mfaEnabled: user.mfaEnabled,
      },
    };
  }

  /**
   * Registro de nuevo usuario
   */
  async register(registerDto: RegisterDto): Promise<{ user: User; message: string }> {
    const { password, ...userData } = registerDto;

    // Crear usuario
    const user = await this.usersService.create(userData, password);

    // Buscar rol por defecto (vendedor) - opcional
    const defaultRole = await this.rolesService.findByName('vendedor');
    if (defaultRole) {
      user.roles = [defaultRole];
      await this.usersService.update(user.id, { roles: [defaultRole] } as any);
    }

    return {
      user,
      message: 'User registered successfully',
    };
  }

  /**
   * Refrescar access token
   */
  async refreshAccessToken(refreshTokenString: string): Promise<{ accessToken: string; expiresIn: number }> {
    // Hash del token para buscarlo
    const tokenHash = crypto.createHash('sha256').update(refreshTokenString).digest('hex');

    // Buscar refresh token
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
      relations: ['user', 'user.roles', 'user.roles.permissions'],
    });

    if (!refreshToken || !refreshToken.isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generar nuevo access token
    const payload = this.createJwtPayload(refreshToken.user);
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      expiresIn: this.parseExpirationToSeconds(this.configService.get<string>('jwt.expiration') || '15m'),
    };
  }

  /**
   * Logout (revocar refresh token)
   */
  async logout(refreshTokenString: string): Promise<void> {
    // Hash del token para buscarlo
    const tokenHash = crypto.createHash('sha256').update(refreshTokenString).digest('hex');

    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
    });

    if (refreshToken) {
      refreshToken.isRevoked = true;
      await this.refreshTokenRepository.save(refreshToken);
    }
  }

  /**
   * Generar tokens JWT (access + refresh)
   */
  private async generateTokens(
    user: User,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number; tokenType: string }> {
    const payload = this.createJwtPayload(user);

    // Access Token
    const accessToken = this.jwtService.sign(payload);

    // Refresh Token
    const refreshTokenString = this.jwtService.sign(
      { sub: user.id, uuid: user.uuid },
    );

    // Hash del refresh token para guardarlo
    const tokenHash = crypto.createHash('sha256').update(refreshTokenString).digest('hex');

    // Guardar refresh token en base de datos
    const refreshTokenExpiration = this.parseExpirationToDate(
      this.configService.get<string>('jwt.refreshExpiration') || '7d',
    );

    const refreshToken = this.refreshTokenRepository.create({
      tokenHash,
      userId: user.id,
      expiresAt: refreshTokenExpiration,
      ipAddress,
      userAgent,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenString,
      expiresIn: this.parseExpirationToSeconds(this.configService.get<string>('jwt.expiration') || '15m'),
      tokenType: 'Bearer',
    };
  }

  /**
   * Crear payload del JWT
   */
  private createJwtPayload(user: User): any {
    const permissions = user.roles.reduce((acc, role) => {
      const rolePermissions = role.permissions.map((p) => p.name);
      return [...acc, ...rolePermissions];
    }, []);

    return {
      sub: user.id,
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      roles: user.roles.map((r) => r.name),
      permissions: [...new Set(permissions)], // Eliminar duplicados
    };
  }

  /**
   * Registrar intento de login
   */
  private async recordLoginAttempt(
    userId: number | null,
    username: string,
    ipAddress: string,
    userAgent: string,
    success: boolean,
    failureReason: string | null,
    mfaUsed: boolean = false,
  ): Promise<void> {
    const attempt = this.loginAttemptRepository.create({
      username,
      ipAddress,
      userAgent,
      success,
      failureReason,
    });

    await this.loginAttemptRepository.save(attempt);
  }

  /**
   * Parsear expiración a segundos
   */
  private parseExpirationToSeconds(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900; // 15 minutos por defecto
    }
  }

  /**
   * Parsear expiración a fecha
   */
  private parseExpirationToDate(expiration: string): Date {
    const seconds = this.parseExpirationToSeconds(expiration);
    const date = new Date();
    date.setSeconds(date.getSeconds() + seconds);
    return date;
  }

  /**
   * Verificar token MFA
   */
  verifyMfaToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Permitir 2 ventanas de tiempo (60 segundos antes/después)
    });
  }

  /**
   * Generar secreto MFA y QR code
   */
  async generateMfaSecret(user: User): Promise<{ qrCode: string; secret: string; manualEntryKey: string; otpauthUrl: string }> {
    const secret = speakeasy.generateSecret({
      name: `${this.configService.get<string>('mfa.appName') || 'Inventory System'} (${user.email})`,
      issuer: this.configService.get<string>('mfa.issuer') || 'YourCompany',
      length: 32,
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url || '');

    return {
      qrCode,
      secret: secret.base32 || '',
      manualEntryKey: secret.base32 || '', // Mismo valor que secret, para mostrar al usuario
      otpauthUrl: secret.otpauth_url || '',
    };
  }

  /**
   * Habilitar MFA para un usuario
   */
  async enableMfa(userId: number, token: string, secret: string): Promise<void> {
    // Verificar token
    const isValid = this.verifyMfaToken(secret, token);
    if (!isValid) {
      throw new BadRequestException('Invalid MFA token');
    }

    // Actualizar usuario
    await this.usersService.update(userId, {
      mfaEnabled: true,
      mfaSecret: secret,
    } as any);
  }

  /**
   * Deshabilitar MFA para un usuario
   */
  async disableMfa(userId: number, password: string, token: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verificar contraseña
    const isValidPassword = await this.usersService.validatePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new BadRequestException('Invalid password');
    }

    // Verificar token MFA
    const isValidToken = this.verifyMfaToken(user.mfaSecret || '', token);
    if (!isValidToken) {
      throw new BadRequestException('Invalid MFA token');
    }

    // Deshabilitar MFA
    await this.usersService.update(userId, {
      mfaEnabled: false,
      mfaSecret: null,
    } as any);
  }
}
