import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsDateString, IsBoolean, IsArray, IsInt, IsEmail, MinLength } from 'class-validator';

export class UpdateEmployeeDto {
  // Datos del usuario
  @ApiProperty({
    description: 'Username for system access',
    example: 'jdoe',
    required: false,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  username?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@company.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewSecurePass123!@#',
    required: false,
    minLength: 12,
  })
  @IsString()
  @IsOptional()
  @MinLength(12)
  password?: string;

  @ApiProperty({
    description: 'Role IDs to assign to the user',
    example: [1, 2],
    required: false,
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  roleIds?: number[];

  @ApiProperty({
    description: 'User active status',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // Datos personales del empleado
  @ApiProperty({
    description: 'Employee first name',
    example: 'John',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({
    description: 'Employee last name',
    example: 'Doe',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({
    description: 'Document type',
    example: 'CI',
    required: false,
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  documentType?: string;

  @ApiProperty({
    description: 'Document number',
    example: '12345678',
    required: false,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  documentNumber?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+591 12345678',
    required: false,
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({
    description: 'Address',
    example: 'Av. Principal #123',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Hire date (YYYY-MM-DD)',
    example: '2025-01-01',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  hireDate?: string;

  @ApiProperty({
    description: 'Termination date (YYYY-MM-DD)',
    example: '2025-12-31',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  terminationDate?: string;

  @ApiProperty({
    description: 'Position/job title',
    example: 'Vendedor',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  position?: string;
}
