import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsNumber, IsInt, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'SKU (unique)', example: 'PROD001', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @ApiProperty({ description: 'Barcode', example: '7501234567890', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  barcode?: string;

  @ApiProperty({ description: 'Product name', example: 'Laptop Dell Inspiron 15' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Category ID', example: 1, required: false })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({ description: 'Cost price', example: 500.00 })
  @IsNumber()
  @Min(0)
  costPrice: number;

  @ApiProperty({ description: 'Sale price', example: 750.00 })
  @IsNumber()
  @Min(0)
  salePrice: number;

  @ApiProperty({ description: 'Weight in kg', example: 2.5, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  weightKg?: number;

  @ApiProperty({ description: 'Dimensions (LxWxH cm)', example: '35x25x2', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  dimensionsCm?: string;

  @ApiProperty({ description: 'Minimum stock', example: 5, default: 0 })
  @IsInt()
  @IsOptional()
  @Min(0)
  minStock?: number;

  @ApiProperty({ description: 'Maximum stock', example: 100, required: false })
  @IsInt()
  @IsOptional()
  @Min(0)
  maxStock?: number;

  @ApiProperty({ description: 'Reorder point', example: 10, required: false })
  @IsInt()
  @IsOptional()
  @Min(0)
  reorderPoint?: number;
}
