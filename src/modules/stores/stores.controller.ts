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
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreResponseDto } from './dto/store-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Stores')
@Controller('stores')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  /**
   * GET /stores - Listar todas las tiendas
   */
  @Get()
  @RequirePermissions('tiendas:list', 'tiendas:read')
  @ApiOperation({ summary: 'List all stores' })
  @ApiResponse({ status: 200, description: 'List of stores', type: [StoreResponseDto] })
  async findAll(): Promise<StoreResponseDto[]> {
    const stores = await this.storesService.findAll();
    return stores.map((store) =>
      plainToInstance(StoreResponseDto, store, { excludeExtraneousValues: false }),
    );
  }

  /**
   * GET /stores/:id - Obtener una tienda por ID
   */
  @Get(':id')
  @RequirePermissions('tiendas:read')
  @ApiOperation({ summary: 'Get store by ID' })
  @ApiParam({ name: 'id', description: 'Store ID' })
  @ApiResponse({ status: 200, description: 'Store found', type: StoreResponseDto })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<StoreResponseDto> {
    const store = await this.storesService.findById(id);

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return plainToInstance(StoreResponseDto, store, { excludeExtraneousValues: false });
  }

  /**
   * POST /stores - Crear una nueva tienda
   */
  @Post()
  @RequirePermissions('tiendas:create')
  @ApiOperation({ summary: 'Create a new store' })
  @ApiResponse({ status: 201, description: 'Store created successfully', type: StoreResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Store code already exists' })
  async create(@Body() createStoreDto: CreateStoreDto): Promise<StoreResponseDto> {
    const store = await this.storesService.create(createStoreDto);

    return plainToInstance(StoreResponseDto, store, { excludeExtraneousValues: false });
  }

  /**
   * PATCH /stores/:id - Actualizar una tienda
   */
  @Patch(':id')
  @RequirePermissions('tiendas:update')
  @ApiOperation({ summary: 'Update a store' })
  @ApiParam({ name: 'id', description: 'Store ID' })
  @ApiResponse({ status: 200, description: 'Store updated successfully', type: StoreResponseDto })
  @ApiResponse({ status: 404, description: 'Store not found' })
  @ApiResponse({ status: 409, description: 'Store code already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<StoreResponseDto> {
    const store = await this.storesService.update(id, updateStoreDto);

    return plainToInstance(StoreResponseDto, store, { excludeExtraneousValues: false });
  }

  /**
   * DELETE /stores/:id/deactivate - Desactivar una tienda
   */
  @Delete(':id/deactivate')
  @RequirePermissions('tiendas:update')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a store' })
  @ApiParam({ name: 'id', description: 'Store ID' })
  @ApiResponse({ status: 204, description: 'Store deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.storesService.deactivate(id);
  }

  /**
   * DELETE /stores/:id - Eliminar una tienda
   */
  @Delete(':id')
  @RequirePermissions('tiendas:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a store' })
  @ApiParam({ name: 'id', description: 'Store ID' })
  @ApiResponse({ status: 204, description: 'Store deleted successfully' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.storesService.remove(id);
  }
}
