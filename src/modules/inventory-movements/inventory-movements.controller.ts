import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus, NotFoundException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { InventoryMovementsService } from './inventory-movements.service';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { UpdateInventoryMovementDto } from './dto/update-inventory-movement.dto';
import { InventoryMovementResponseDto } from './dto/inventory-movement-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Inventory Movements')
@Controller('inventory-movements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class InventoryMovementsController {
  constructor(private readonly inventoryMovementsService: InventoryMovementsService) {}

  @Get()
  @RequirePermissions('movimientos:list', 'movimientos:read')
  @ApiOperation({ summary: 'List inventory movements' })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'locationId', required: false })
  @ApiResponse({ status: 200, type: [InventoryMovementResponseDto] })
  async findAll(
    @Query('productId') productId?: string,
    @Query('locationId') locationId?: string,
  ): Promise<InventoryMovementResponseDto[]> {
    let movements;
    if (productId) {
      movements = await this.inventoryMovementsService.findByProductId(parseInt(productId));
    } else if (locationId) {
      movements = await this.inventoryMovementsService.findByLocationId(parseInt(locationId));
    } else {
      movements = await this.inventoryMovementsService.findAll();
    }
    return movements.map((m) => plainToInstance(InventoryMovementResponseDto, m, { excludeExtraneousValues: false }));
  }

  @Get(':id')
  @RequirePermissions('movimientos:read')
  @ApiOperation({ summary: 'Get movement by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: InventoryMovementResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<InventoryMovementResponseDto> {
    const movement = await this.inventoryMovementsService.findById(id);
    if (!movement) throw new NotFoundException('Inventory movement not found');
    return plainToInstance(InventoryMovementResponseDto, movement, { excludeExtraneousValues: false });
  }

  @Post()
  @RequirePermissions('movimientos:create')
  @ApiOperation({ summary: 'Create inventory movement' })
  @ApiResponse({ status: 201, type: InventoryMovementResponseDto })
  async create(@Body() dto: CreateInventoryMovementDto): Promise<InventoryMovementResponseDto> {
    const movement = await this.inventoryMovementsService.create(dto);
    return plainToInstance(InventoryMovementResponseDto, movement, { excludeExtraneousValues: false });
  }

  @Patch(':id')
  @RequirePermissions('movimientos:update')
  @ApiOperation({ summary: 'Update inventory movement' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: InventoryMovementResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInventoryMovementDto,
  ): Promise<InventoryMovementResponseDto> {
    const movement = await this.inventoryMovementsService.update(id, dto);
    return plainToInstance(InventoryMovementResponseDto, movement, { excludeExtraneousValues: false });
  }

  @Delete(':id')
  @RequirePermissions('movimientos:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete inventory movement' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.inventoryMovementsService.remove(id);
  }
}
