import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsEmail, IsEnum, IsBoolean } from 'class-validator';

export class UpdateCustomerDto {
  @ApiProperty({
    description: 'Customer code (unique)',
    example: 'C001',
    required: false,
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  code?: string;

  @ApiProperty({
    description: 'First name',
    example: 'Juan',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Pérez',
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
    description: 'Email address',
    example: 'juan.perez@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

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
    example: 'Calle Principal #123',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'City',
    example: 'La Paz',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiProperty({
    description: 'Customer type',
    example: 'individual',
    enum: ['individual', 'business'],
    required: false,
  })
  @IsEnum(['individual', 'business'])
  @IsOptional()
  customerType?: 'individual' | 'business';

  @ApiProperty({
    description: 'Tax ID (for business customers)',
    example: '1234567890',
    required: false,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  taxId?: string;

  @ApiProperty({
    description: 'Active status',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
