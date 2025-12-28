import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleResponseDto } from './dto/sale-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Sales')
@Controller('sales')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @RequirePermissions('ventas:list', 'ventas:read')
  @ApiOperation({ summary: 'List all sales' })
  @ApiResponse({ status: 200, type: [SaleResponseDto] })
  async findAll(): Promise<SaleResponseDto[]> {
    const sales = await this.salesService.findAll();
    return sales.map((s) => plainToInstance(SaleResponseDto, s, { excludeExtraneousValues: false }));
  }

  @Get(':id')
  @RequirePermissions('ventas:read')
  @ApiOperation({ summary: 'Get sale by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: SaleResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SaleResponseDto> {
    const sale = await this.salesService.findById(id);
    if (!sale) throw new NotFoundException('Sale not found');
    return plainToInstance(SaleResponseDto, sale, { excludeExtraneousValues: false });
  }

  @Post()
  @RequirePermissions('ventas:create')
  @ApiOperation({ summary: 'Create sale with items' })
  @ApiResponse({ status: 201, type: SaleResponseDto })
  async create(@Body() dto: CreateSaleDto): Promise<SaleResponseDto> {
    const sale = await this.salesService.create(dto);
    return plainToInstance(SaleResponseDto, sale, { excludeExtraneousValues: false });
  }

  @Delete(':id')
  @RequirePermissions('ventas:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete sale' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.salesService.remove(id);
  }
}
