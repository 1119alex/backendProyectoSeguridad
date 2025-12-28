import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsDateString, IsEmail, MinLength, IsArray, IsInt } from 'class-validator';

export class CreateEmployeeDto {
  // Datos del usuario (para crear en tabla users)
  @ApiProperty({
    description: 'Username for system access',
    example: 'jdoe',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@company.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password for system access (minimum 12 characters)',
    example: 'SecurePass123!@#',
    minLength: 12,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  password: string;

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

  // Datos personales del empleado (para tabla employees)
  @ApiProperty({
    description: 'Employee first name',
    example: 'John',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    description: 'Employee last name',
    example: 'Doe',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    description: 'Document type',
    example: 'CI',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  documentType: string;

  @ApiProperty({
    description: 'Document number',
    example: '12345678',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  documentNumber: string;

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
  })
  @IsDateString()
  @IsNotEmpty()
  hireDate: string;

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
