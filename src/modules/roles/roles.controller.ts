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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * GET /roles - Listar todos los roles
   */
  @Get()
  @RequirePermissions('roles:list', 'roles:read')
  @ApiOperation({ summary: 'List all roles' })
  @ApiResponse({ status: 200, description: 'List of roles', type: [RoleResponseDto] })
  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.rolesService.findAll();
    return roles.map((role) => plainToInstance(RoleResponseDto, role, { excludeExtraneousValues: false }));
  }

  /**
   * GET /roles/:id - Obtener un rol por ID
   */
  @Get(':id')
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role found', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RoleResponseDto> {
    const role = await this.rolesService.findById(id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return plainToInstance(RoleResponseDto, role, { excludeExtraneousValues: false });
  }

  /**
   * POST /roles - Crear un nuevo rol
   */
  @Post()
  @RequirePermissions('roles:create')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully', type: RoleResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const { permissionIds, ...roleData } = createRoleDto;

    // Crear rol con permisos
    const role = await this.rolesService.create(roleData, permissionIds);

    // Recargar rol con permisos
    const roleWithPermissions = await this.rolesService.findById(role.id);

    return plainToInstance(RoleResponseDto, roleWithPermissions, { excludeExtraneousValues: false });
  }

  /**
   * PATCH /roles/:id - Actualizar un rol
   */
  @Patch(':id')
  @RequirePermissions('roles:update')
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role updated successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    const { permissionIds, ...updateData } = updateRoleDto;

    // Actualizar rol
    const role = await this.rolesService.update(id, updateData, permissionIds);

    // Recargar rol con permisos
    const roleWithPermissions = await this.rolesService.findById(role.id);

    return plainToInstance(RoleResponseDto, roleWithPermissions, { excludeExtraneousValues: false });
  }

  /**
   * DELETE /roles/:id - Eliminar un rol (soft delete)
   */
  @Delete(':id')
  @RequirePermissions('roles:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a role (soft delete)' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 204, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.rolesService.softDelete(id);
  }
}
