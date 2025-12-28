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
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Employees')
@Controller('employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  /**
   * GET /employees - Listar todos los empleados
   */
  @Get()
  @RequirePermissions('empleados:list', 'empleados:read')
  @ApiOperation({ summary: 'List all employees' })
  @ApiResponse({ status: 200, description: 'List of employees', type: [EmployeeResponseDto] })
  async findAll(): Promise<EmployeeResponseDto[]> {
    const employees = await this.employeesService.findAll();
    return employees.map((employee) =>
      plainToInstance(EmployeeResponseDto, employee, { excludeExtraneousValues: false }),
    );
  }

  /**
   * GET /employees/:id - Obtener un empleado por ID
   */
  @Get(':id')
  @RequirePermissions('empleados:read')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Employee found', type: EmployeeResponseDto })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<EmployeeResponseDto> {
    const employee = await this.employeesService.findById(id);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return plainToInstance(EmployeeResponseDto, employee, { excludeExtraneousValues: false });
  }

  /**
   * POST /employees - Crear un nuevo empleado (con usuario)
   */
  @Post()
  @RequirePermissions('empleados:create')
  @ApiOperation({
    summary: 'Create a new employee',
    description: 'Creates both a user account and employee record in a single transaction',
  })
  @ApiResponse({ status: 201, description: 'Employee created successfully', type: EmployeeResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Username, email, or document number already exists' })
  async create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    const employee = await this.employeesService.create(createEmployeeDto);

    return plainToInstance(EmployeeResponseDto, employee, { excludeExtraneousValues: false });
  }

  /**
   * PATCH /employees/:id - Actualizar un empleado
   */
  @Patch(':id')
  @RequirePermissions('empleados:update')
  @ApiOperation({ summary: 'Update an employee' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully', type: EmployeeResponseDto })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 409, description: 'Document number already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    const employee = await this.employeesService.update(id, updateEmployeeDto);

    return plainToInstance(EmployeeResponseDto, employee, { excludeExtraneousValues: false });
  }

  /**
   * DELETE /employees/:id/deactivate - Desactivar un empleado
   */
  @Delete(':id/deactivate')
  @RequirePermissions('empleados:update')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate an employee and their user account' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({ status: 204, description: 'Employee deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.employeesService.deactivate(id);
  }

  /**
   * DELETE /employees/:id - Eliminar un empleado
   */
  @Delete(':id')
  @RequirePermissions('empleados:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an employee (soft delete)' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({ status: 204, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.employeesService.remove(id);
  }
}
