import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus, NotFoundException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { WarehouseInventoryService } from './warehouse-inventory.service';
import { CreateWarehouseInventoryDto } from './dto/create-warehouse-inventory.dto';
import { UpdateWarehouseInventoryDto } from './dto/update-warehouse-inventory.dto';
import { WarehouseInventoryResponseDto } from './dto/warehouse-inventory-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Warehouse Inventory')
@Controller('warehouse-inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class WarehouseInventoryController {
  constructor(private readonly warehouseInventoryService: WarehouseInventoryService) {}

  @Get()
  @RequirePermissions('inventario:list', 'inventario:read')
  @ApiOperation({ summary: 'List warehouse inventory' })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiQuery({ name: 'productId', required: false })
  @ApiResponse({ status: 200, type: [WarehouseInventoryResponseDto] })
  async findAll(@Query('warehouseId') warehouseId?: string, @Query('productId') productId?: string): Promise<WarehouseInventoryResponseDto[]> {
    let inventories;
    if (warehouseId) inventories = await this.warehouseInventoryService.findByWarehouseId(parseInt(warehouseId));
    else if (productId) inventories = await this.warehouseInventoryService.findByProductId(parseInt(productId));
    else inventories = await this.warehouseInventoryService.findAll();
    return inventories.map((i) => plainToInstance(WarehouseInventoryResponseDto, i, { excludeExtraneousValues: false }));
  }

  @Get(':id')
  @RequirePermissions('inventario:read')
  @ApiOperation({ summary: 'Get warehouse inventory by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: WarehouseInventoryResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<WarehouseInventoryResponseDto> {
    const inventory = await this.warehouseInventoryService.findById(id);
    if (!inventory) throw new NotFoundException('Warehouse inventory not found');
    return plainToInstance(WarehouseInventoryResponseDto, inventory, { excludeExtraneousValues: false });
  }

  @Post()
  @RequirePermissions('inventario:create')
  @ApiOperation({ summary: 'Create warehouse inventory record' })
  @ApiResponse({ status: 201, type: WarehouseInventoryResponseDto })
  async create(@Body() dto: CreateWarehouseInventoryDto): Promise<WarehouseInventoryResponseDto> {
    const inventory = await this.warehouseInventoryService.create(dto);
    return plainToInstance(WarehouseInventoryResponseDto, inventory, { excludeExtraneousValues: false });
  }

  @Patch(':id')
  @RequirePermissions('inventario:update')
  @ApiOperation({ summary: 'Update warehouse inventory' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: WarehouseInventoryResponseDto })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWarehouseInventoryDto): Promise<WarehouseInventoryResponseDto> {
    const inventory = await this.warehouseInventoryService.update(id, dto);
    return plainToInstance(WarehouseInventoryResponseDto, inventory, { excludeExtraneousValues: false });
  }

  @Delete(':id')
  @RequirePermissions('inventario:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete warehouse inventory' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.warehouseInventoryService.remove(id);
  }
}
