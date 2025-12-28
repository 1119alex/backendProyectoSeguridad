import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsEmail, IsBoolean } from 'class-validator';

export class UpdateSupplierDto {
  @ApiProperty({ description: 'Supplier code', required: false, maxLength: 20 })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  code?: string;

  @ApiProperty({ description: 'Business name', required: false, maxLength: 200 })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  businessName?: string;

  @ApiProperty({ description: 'Tax ID', required: false, maxLength: 50 })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  taxId?: string;

  @ApiProperty({ description: 'Contact name', required: false, maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  contactName?: string;

  @ApiProperty({ description: 'Email', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Phone', required: false, maxLength: 20 })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ description: 'Address', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'City', required: false, maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ description: 'Country', required: false, maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ description: 'Payment terms', required: false, maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  paymentTerms?: string;

  @ApiProperty({ description: 'Active status', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
