import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto, MfaRequiredDto } from './dto/login.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { RefreshTokenDto, RefreshTokenResponseDto } from './dto/refresh-token.dto';
import { EnableMfaDto, VerifyMfaDto, MfaSetupResponseDto, DisableMfaDto } from './dto/mfa.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { generateCsrfToken } from '../../common/guards/csrf.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register - Registro de nuevo usuario
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: RegisterResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Username or email already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const { user, message } = await this.authService.register(registerDto);

    return {
      id: user.id,
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      message,
    };
  }

  /**
   * POST /auth/login - Login de usuario
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 intentos en 15 minutos
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto | MfaRequiredDto> {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await this.authService.login(loginDto, ipAddress, userAgent);

    // Si el login es exitoso (no requiere MFA), guardar tokens en HttpOnly cookies
    if ('accessToken' in result) {
      // HttpOnly cookie para access token (15 minutos)
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutos
      });

      // HttpOnly cookie para refresh token (7 días)
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });
    }

    return result;
  }

  /**
   * POST /auth/refresh - Refrescar access token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed', type: RefreshTokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() refreshTokenDto?: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    // Intentar obtener el refresh token de las cookies primero, luego del body
    const refreshToken = req.cookies?.refreshToken || refreshTokenDto?.refreshToken;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token not provided');
    }

    const { accessToken, expiresIn } = await this.authService.refreshAccessToken(refreshToken);

    // Actualizar access token en cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer',
    };
  }

  /**
   * POST /auth/logout - Cerrar sesión (revocar refresh token)
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (revoke refresh token)' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() refreshTokenDto?: RefreshTokenDto,
  ): Promise<{ message: string }> {
    // Obtener refresh token de cookies o body
    const refreshToken = req.cookies?.refreshToken || refreshTokenDto?.refreshToken;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Limpiar cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { message: 'Logout successful' };
  }

  /**
   * GET /auth/me - Obtener usuario actual
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Current user data' })
  async me(@CurrentUser() user: any) {
    return user;
  }

  /**
   * GET /auth/csrf-token - Obtener CSRF token
   */
  @Public()
  @Get('csrf-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get CSRF token for form submissions' })
  @ApiResponse({ status: 200, description: 'CSRF token generated' })
  async getCsrfToken(@Res({ passthrough: true }) res: Response): Promise<{ csrfToken: string }> {
    const csrfToken = generateCsrfToken();

    // Set CSRF token in cookie (not HttpOnly so frontend can read it)
    res.cookie('csrf-token', csrfToken, {
      httpOnly: false, // Frontend needs to read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    });

    return { csrfToken };
  }

  /**
   * POST /auth/mfa/setup - Generar QR code para MFA
   */
  @UseGuards(JwtAuthGuard)
  @Post('mfa/setup')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate MFA QR code' })
  @ApiResponse({ status: 200, description: 'MFA setup data', type: MfaSetupResponseDto })
  async setupMfa(@CurrentUser() user: any): Promise<MfaSetupResponseDto> {
    // Obtener usuario completo
    const fullUser = await this.authService['usersService'].findById(user.id);
    if (!fullUser) {
      throw new Error('User not found');
    }
    const mfaData = await this.authService.generateMfaSecret(fullUser);

    // Guardar el secret temporalmente en la BD (sin habilitar MFA aún)
    await this.authService['usersService'].update(user.id, {
      mfaSecret: mfaData.secret,
    } as any);

    return mfaData;
  }

  /**
   * POST /auth/mfa/enable - Habilitar MFA
   */
  @UseGuards(JwtAuthGuard)
  @Post('mfa/enable')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable MFA for user' })
  @ApiResponse({ status: 200, description: 'MFA enabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async enableMfa(
    @CurrentUser() user: any,
    @Body() enableMfaDto: EnableMfaDto,
  ): Promise<{ message: string }> {
    // Obtener el usuario con el secret temporal que se guardó en el setup
    const fullUser = await this.authService['usersService'].findById(user.id);
    if (!fullUser) {
      throw new Error('User not found');
    }

    // El secret temporal debe estar guardado en mfa_secret (aunque mfa_enabled sea false)
    if (!fullUser.mfaSecret) {
      throw new BadRequestException('MFA setup not completed. Please call /mfa/setup first');
    }

    await this.authService.enableMfa(user.id, enableMfaDto.token, fullUser.mfaSecret);
    return { message: 'MFA enabled successfully' };
  }

  /**
   * POST /auth/mfa/verify - Verificar token MFA
   */
  @UseGuards(JwtAuthGuard)
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify MFA token' })
  @ApiResponse({ status: 200, description: 'Token verified' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async verifyMfa(
    @CurrentUser() user: any,
    @Body() verifyMfaDto: VerifyMfaDto,
  ): Promise<{ valid: boolean }> {
    const fullUser = await this.authService['usersService'].findById(user.id);
    if (!fullUser) {
      throw new Error('User not found');
    }
    const valid = this.authService.verifyMfaToken(fullUser.mfaSecret || '', verifyMfaDto.token);
    return { valid };
  }

  /**
   * POST /auth/mfa/disable - Deshabilitar MFA
   */
  @UseGuards(JwtAuthGuard)
  @Post('mfa/disable')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable MFA for user' })
  @ApiResponse({ status: 200, description: 'MFA disabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid credentials or token' })
  async disableMfa(
    @CurrentUser() user: any,
    @Body() disableMfaDto: DisableMfaDto,
  ): Promise<{ message: string }> {
    await this.authService.disableMfa(user.id, disableMfaDto.password, disableMfaDto.token);
    return { message: 'MFA disabled successfully' };
  }
}
