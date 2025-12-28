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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Suppliers')
@Controller('suppliers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @RequirePermissions('proveedores:list', 'proveedores:read')
  @ApiOperation({ summary: 'List all suppliers' })
  @ApiResponse({ status: 200, description: 'List of suppliers', type: [SupplierResponseDto] })
  async findAll(): Promise<SupplierResponseDto[]> {
    const suppliers = await this.suppliersService.findAll();
    return suppliers.map((s) => plainToInstance(SupplierResponseDto, s, { excludeExtraneousValues: false }));
  }

  @Get(':id')
  @RequirePermissions('proveedores:read')
  @ApiOperation({ summary: 'Get supplier by ID' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier found', type: SupplierResponseDto })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SupplierResponseDto> {
    const supplier = await this.suppliersService.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');
    return plainToInstance(SupplierResponseDto, supplier, { excludeExtraneousValues: false });
  }

  @Post()
  @RequirePermissions('proveedores:create')
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created', type: SupplierResponseDto })
  @ApiResponse({ status: 409, description: 'Supplier code already exists' })
  async create(@Body() createDto: CreateSupplierDto): Promise<SupplierResponseDto> {
    const supplier = await this.suppliersService.create(createDto);
    return plainToInstance(SupplierResponseDto, supplier, { excludeExtraneousValues: false });
  }

  @Patch(':id')
  @RequirePermissions('proveedores:update')
  @ApiOperation({ summary: 'Update a supplier' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier updated', type: SupplierResponseDto })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateSupplierDto): Promise<SupplierResponseDto> {
    const supplier = await this.suppliersService.update(id, updateDto);
    return plainToInstance(SupplierResponseDto, supplier, { excludeExtraneousValues: false });
  }

  @Delete(':id')
  @RequirePermissions('proveedores:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a supplier' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 204, description: 'Supplier deleted' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.suppliersService.remove(id);
  }
}
