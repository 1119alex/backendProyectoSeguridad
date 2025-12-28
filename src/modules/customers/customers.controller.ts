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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /**
   * GET /customers - Listar todos los clientes
   */
  @Get()
  @RequirePermissions('clientes:list', 'clientes:read')
  @ApiOperation({ summary: 'List all customers' })
  @ApiResponse({ status: 200, description: 'List of customers', type: [CustomerResponseDto] })
  async findAll(): Promise<CustomerResponseDto[]> {
    const customers = await this.customersService.findAll();
    return customers.map((customer) =>
      plainToInstance(CustomerResponseDto, customer, { excludeExtraneousValues: false }),
    );
  }

  /**
   * GET /customers/:id - Obtener un cliente por ID
   */
  @Get(':id')
  @RequirePermissions('clientes:read')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer found', type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CustomerResponseDto> {
    const customer = await this.customersService.findById(id);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return plainToInstance(CustomerResponseDto, customer, { excludeExtraneousValues: false });
  }

  /**
   * POST /customers - Crear un nuevo cliente
   */
  @Post()
  @RequirePermissions('clientes:create')
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully', type: CustomerResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Customer code or document number already exists' })
  async create(@Body() createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    const customer = await this.customersService.create(createCustomerDto);

    return plainToInstance(CustomerResponseDto, customer, { excludeExtraneousValues: false });
  }

  /**
   * PATCH /customers/:id - Actualizar un cliente
   */
  @Patch(':id')
  @RequirePermissions('clientes:update')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully', type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 409, description: 'Customer code or document number already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customersService.update(id, updateCustomerDto);

    return plainToInstance(CustomerResponseDto, customer, { excludeExtraneousValues: false });
  }

  /**
   * DELETE /customers/:id/deactivate - Desactivar un cliente
   */
  @Delete(':id/deactivate')
  @RequirePermissions('clientes:update')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 204, description: 'Customer deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.customersService.deactivate(id);
  }

  /**
   * DELETE /customers/:id - Eliminar un cliente
   */
  @Delete(':id')
  @RequirePermissions('clientes:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 204, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.customersService.remove(id);
  }
}
