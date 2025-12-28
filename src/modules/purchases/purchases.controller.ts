import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PurchaseResponseDto } from './dto/purchase-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Purchases')
@Controller('purchases')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get()
  @RequirePermissions('compras:list', 'compras:read')
  @ApiOperation({ summary: 'List all purchases' })
  @ApiResponse({ status: 200, type: [PurchaseResponseDto] })
  async findAll(): Promise<PurchaseResponseDto[]> {
    const purchases = await this.purchasesService.findAll();
    return purchases.map((p) => plainToInstance(PurchaseResponseDto, p, { excludeExtraneousValues: false }));
  }

  @Get(':id')
  @RequirePermissions('compras:read')
  @ApiOperation({ summary: 'Get purchase by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: PurchaseResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PurchaseResponseDto> {
    const purchase = await this.purchasesService.findById(id);
    if (!purchase) throw new NotFoundException('Purchase not found');
    return plainToInstance(PurchaseResponseDto, purchase, { excludeExtraneousValues: false });
  }

  @Post()
  @RequirePermissions('compras:create')
  @ApiOperation({ summary: 'Create a new purchase' })
  @ApiResponse({ status: 201, type: PurchaseResponseDto })
  async create(@Body() dto: CreatePurchaseDto): Promise<PurchaseResponseDto> {
    const purchase = await this.purchasesService.create(dto);
    return plainToInstance(PurchaseResponseDto, purchase, { excludeExtraneousValues: false });
  }

  @Patch(':id')
  @RequirePermissions('compras:update')
  @ApiOperation({ summary: 'Update a purchase' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: PurchaseResponseDto })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePurchaseDto): Promise<PurchaseResponseDto> {
    const purchase = await this.purchasesService.update(id, dto);
    return plainToInstance(PurchaseResponseDto, purchase, { excludeExtraneousValues: false });
  }

  @Delete(':id')
  @RequirePermissions('compras:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a purchase' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.purchasesService.remove(id);
  }
}
