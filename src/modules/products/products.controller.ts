import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermissions('productos:list', 'productos:read')
  @ApiOperation({ summary: 'List all products' })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productsService.findAll();
    return products.map((p) => plainToInstance(ProductResponseDto, p, { excludeExtraneousValues: false }));
  }

  @Get(':id')
  @RequirePermissions('productos:read')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductResponseDto> {
    const product = await this.productsService.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return plainToInstance(ProductResponseDto, product, { excludeExtraneousValues: false });
  }

  @Post()
  @RequirePermissions('productos:create')
  @ApiOperation({ summary: 'Create product' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  async create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.productsService.create(dto);
    return plainToInstance(ProductResponseDto, product, { excludeExtraneousValues: false });
  }

  @Patch(':id')
  @RequirePermissions('productos:update')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productsService.update(id, dto);
    return plainToInstance(ProductResponseDto, product, { excludeExtraneousValues: false });
  }

  @Delete(':id')
  @RequirePermissions('productos:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.productsService.remove(id);
  }
}
