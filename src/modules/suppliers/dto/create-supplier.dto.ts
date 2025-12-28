import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEmail } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ description: 'Supplier code (unique)', example: 'S001', maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({ description: 'Business name', example: 'Distribuidora ABC S.A.', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  businessName: string;

  @ApiProperty({ description: 'Tax ID (NIT, RUC, etc.)', example: '1234567890', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  taxId: string;

  @ApiProperty({ description: 'Contact name', example: 'Carlos Mendez', required: false, maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  contactName?: string;

  @ApiProperty({ description: 'Email', example: 'contacto@distribuidora.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Phone', example: '+591 12345678', required: false, maxLength: 20 })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ description: 'Address', example: 'Av. Industrial 456', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'City', example: 'Santa Cruz', required: false, maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ description: 'Country', example: 'Bolivia', required: false, maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ description: 'Payment terms', example: '30 días', required: false, maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  paymentTerms?: string;
}
