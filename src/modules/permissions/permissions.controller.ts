import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * GET /permissions - Listar todos los permisos
   */
  @Get()
  @RequirePermissions('permissions:list', 'permissions:read')
  @ApiOperation({ summary: 'List all permissions' })
  @ApiQuery({ name: 'resource', required: false, description: 'Filter by resource (productos, inventario, etc.)' })
  @ApiResponse({ status: 200, description: 'List of permissions', type: [PermissionResponseDto] })
  async findAll(@Query('resource') resource?: string): Promise<PermissionResponseDto[]> {
    const permissions = resource
      ? await this.permissionsService.findByResource(resource)
      : await this.permissionsService.findAll();

    return permissions.map((permission) => ({
      id: permission.id,
      name: permission.name,
      resource: permission.resource,
      module: permission.resource, // Alias for frontend
      displayName: this.generateDisplayName(permission.resource, permission.action),
      action: permission.action,
      description: permission.description,
      createdAt: permission.createdAt,
    }));
  }

  private generateDisplayName(resource: string, action: string): string {
    const actionLabels: Record<string, string> = {
      list: 'Listar',
      read: 'Ver',
      create: 'Crear',
      update: 'Actualizar',
      delete: 'Eliminar',
      export: 'Exportar',
    };

    const resourceLabels: Record<string, string> = {
      productos: 'Productos',
      categorias: 'Categorías',
      inventario: 'Inventario',
      ventas: 'Ventas',
      compras: 'Compras',
      transferencias: 'Transferencias',
      movimientos: 'Movimientos',
      clientes: 'Clientes',
      proveedores: 'Proveedores',
      empleados: 'Empleados',
      tiendas: 'Tiendas',
      almacenes: 'Almacenes',
      usuarios: 'Usuarios',
      roles: 'Roles',
      permissions: 'Permisos',
    };

    const actionLabel = actionLabels[action] || action;
    const resourceLabel = resourceLabels[resource] || resource;

    return `${actionLabel} ${resourceLabel}`;
  }

  /**
   * GET /permissions/:id - Obtener un permiso por ID
   */
  @Get(':id')
  @RequirePermissions('permissions:read')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({ status: 200, description: 'Permission found', type: PermissionResponseDto })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PermissionResponseDto> {
    const permission = await this.permissionsService.findById(id);

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return {
      id: permission.id,
      name: permission.name,
      resource: permission.resource,
      module: permission.resource,
      displayName: this.generateDisplayName(permission.resource, permission.action),
      action: permission.action,
      description: permission.description,
      createdAt: permission.createdAt,
    };
  }
}
