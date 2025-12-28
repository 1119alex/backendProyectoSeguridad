import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus, NotFoundException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { StoreInventoryService } from './store-inventory.service';
import { CreateStoreInventoryDto } from './dto/create-store-inventory.dto';
import { UpdateStoreInventoryDto } from './dto/update-store-inventory.dto';
import { StoreInventoryResponseDto } from './dto/store-inventory-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Store Inventory')
@Controller('store-inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class StoreInventoryController {
  constructor(private readonly storeInventoryService: StoreInventoryService) {}

  @Get()
  @RequirePermissions('inventario:list', 'inventario:read')
  @ApiOperation({ summary: 'List inventory' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'productId', required: false })
  @ApiResponse({ status: 200, type: [StoreInventoryResponseDto] })
  async findAll(@Query('storeId') storeId?: string, @Query('productId') productId?: string): Promise<StoreInventoryResponseDto[]> {
    let inventories;
    if (storeId) inventories = await this.storeInventoryService.findByStoreId(parseInt(storeId));
    else if (productId) inventories = await this.storeInventoryService.findByProductId(parseInt(productId));
    else inventories = await this.storeInventoryService.findAll();
    return inventories.map((i) => plainToInstance(StoreInventoryResponseDto, i, { excludeExtraneousValues: false }));
  }

  @Get(':id')
  @RequirePermissions('inventario:read')
  @ApiOperation({ summary: 'Get inventory by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: StoreInventoryResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<StoreInventoryResponseDto> {
    const inventory = await this.storeInventoryService.findById(id);
    if (!inventory) throw new NotFoundException('Store inventory not found');
    return plainToInstance(StoreInventoryResponseDto, inventory, { excludeExtraneousValues: false });
  }

  @Post()
  @RequirePermissions('inventario:create')
  @ApiOperation({ summary: 'Create inventory record' })
  @ApiResponse({ status: 201, type: StoreInventoryResponseDto })
  async create(@Body() dto: CreateStoreInventoryDto): Promise<StoreInventoryResponseDto> {
    const inventory = await this.storeInventoryService.create(dto);
    return plainToInstance(StoreInventoryResponseDto, inventory, { excludeExtraneousValues: false });
  }

  @Patch(':id')
  @RequirePermissions('inventario:update')
  @ApiOperation({ summary: 'Update inventory' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: StoreInventoryResponseDto })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStoreInventoryDto): Promise<StoreInventoryResponseDto> {
    const inventory = await this.storeInventoryService.update(id, dto);
    return plainToInstance(StoreInventoryResponseDto, inventory, { excludeExtraneousValues: false });
  }

  @Delete(':id')
  @RequirePermissions('inventario:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete inventory' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.storeInventoryService.remove(id);
  }
}
