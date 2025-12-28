import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  /**
   * GET /users - Listar todos los usuarios
   */
  @Get()
  @RequirePermissions('usuarios:list', 'usuarios:read')
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: [UserResponseDto] })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => plainToInstance(UserResponseDto, user, { excludeExtraneousValues: false }));
  }

  /**
   * GET /users/:id - Obtener un usuario por ID
   */
  @Get(':id')
  @RequirePermissions('usuarios:read')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: false });
  }

  /**
   * POST /users - Crear un nuevo usuario
   */
  @Post()
  @RequirePermissions('usuarios:create')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Username or email already exists' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { password, roleIds, ...userData } = createUserDto;

    // Crear usuario
    const user = await this.usersService.create(userData, password);

    // Asignar roles si se proporcionaron
    if (roleIds && roleIds.length > 0) {
      const roles = await Promise.all(
        roleIds.map((roleId) => this.rolesService.findById(roleId)),
      );

      // Filtrar roles nulos
      const validRoles = roles.filter((role) => role !== null);

      if (validRoles.length > 0) {
        user.roles = validRoles;
        await this.usersService.update(user.id, { roles: validRoles } as any);
      }
    }

    // Recargar usuario con roles
    const updatedUser = await this.usersService.findById(user.id);

    return plainToInstance(UserResponseDto, updatedUser, { excludeExtraneousValues: false });
  }

  /**
   * PATCH /users/:id - Actualizar un usuario
   */
  @Patch(':id')
  @RequirePermissions('usuarios:update')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const { password, roleIds, ...updateData } = updateUserDto;

    // Verificar que el usuario existe
    const existingUser = await this.usersService.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Si se proporciona una nueva contraseña, hashearla
    if (password) {
      const passwordHash = await this.usersService.hashPassword(password);
      Object.assign(updateData, { passwordHash });
    }

    // Actualizar roles si se proporcionaron
    if (roleIds !== undefined) {
      if (roleIds.length > 0) {
        const roles = await Promise.all(
          roleIds.map((roleId) => this.rolesService.findById(roleId)),
        );
        const validRoles = roles.filter((role) => role !== null);
        Object.assign(updateData, { roles: validRoles });
      } else {
        Object.assign(updateData, { roles: [] });
      }
    }

    // Actualizar usuario
    const updatedUser = await this.usersService.update(id, updateData);

    // Recargar usuario con roles
    const userWithRoles = await this.usersService.findById(updatedUser.id);

    return plainToInstance(UserResponseDto, userWithRoles, { excludeExtraneousValues: false });
  }

  /**
   * DELETE /users/:id - Eliminar un usuario (soft delete)
   */
  @Delete(':id')
  @RequirePermissions('usuarios:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user (soft delete)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.softDelete(id);
  }
}
