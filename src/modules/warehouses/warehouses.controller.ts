import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehouseResponseDto } from './dto/warehouse-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Warehouses')
@Controller('warehouses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  @RequirePermissions('almacenes:list', 'almacenes:read')
  @ApiOperation({ summary: 'List all warehouses' })
  @ApiResponse({ status: 200, type: [WarehouseResponseDto] })
  async findAll(): Promise<WarehouseResponseDto[]> {
    const warehouses = await this.warehousesService.findAll();
    return warehouses.map((w) => plainToInstance(WarehouseResponseDto, w, { excludeExtraneousValues: false }));
  }

  @Get(':id')
  @RequirePermissions('almacenes:read')
  @ApiOperation({ summary: 'Get warehouse by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: WarehouseResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<WarehouseResponseDto> {
    const warehouse = await this.warehousesService.findById(id);
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    return plainToInstance(WarehouseResponseDto, warehouse, { excludeExtraneousValues: false });
  }

  @Post()
  @RequirePermissions('almacenes:create')
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiResponse({ status: 201, type: WarehouseResponseDto })
  async create(@Body() dto: CreateWarehouseDto): Promise<WarehouseResponseDto> {
    const warehouse = await this.warehousesService.create(dto);
    return plainToInstance(WarehouseResponseDto, warehouse, { excludeExtraneousValues: false });
  }

  @Patch(':id')
  @RequirePermissions('almacenes:update')
  @ApiOperation({ summary: 'Update a warehouse' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: WarehouseResponseDto })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWarehouseDto): Promise<WarehouseResponseDto> {
    const warehouse = await this.warehousesService.update(id, dto);
    return plainToInstance(WarehouseResponseDto, warehouse, { excludeExtraneousValues: false });
  }

  @Delete(':id')
  @RequirePermissions('almacenes:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a warehouse' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.warehousesService.remove(id);
  }
}
