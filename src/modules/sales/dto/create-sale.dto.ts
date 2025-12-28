import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsOptional, IsNumber, Min, IsEnum, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class CreateSaleItemDto {
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ description: 'Quantity', example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Unit price', example: 100.00 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: 'Discount', example: 0, default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number;
}

export class CreateSaleDto {
  @ApiProperty({ description: 'Sale number (unique)', example: 'V-001' })
  @IsString()
  @IsNotEmpty()
  saleNumber: string;

  @ApiProperty({ description: 'Store ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  storeId: number;

  @ApiProperty({ description: 'Customer ID', example: 1, required: false })
  @IsInt()
  @IsOptional()
  customerId?: number;

  @ApiProperty({ description: 'Sale date', example: '2025-11-27T12:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  saleDate?: string;

  @ApiProperty({ description: 'Tax amount', example: 13.00, default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  tax?: number;

  @ApiProperty({ description: 'Discount amount', example: 0, default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number;

  @ApiProperty({ description: 'Payment method', enum: ['cash', 'card', 'transfer', 'credit'] })
  @IsEnum(['cash', 'card', 'transfer', 'credit'])
  paymentMethod: 'cash' | 'card' | 'transfer' | 'credit';

  @ApiProperty({ description: 'Payment status', enum: ['pending', 'partial', 'paid', 'cancelled'], default: 'paid' })
  @IsEnum(['pending', 'partial', 'paid', 'cancelled'])
  @IsOptional()
  paymentStatus?: 'pending' | 'partial' | 'paid' | 'cancelled';

  @ApiProperty({ description: 'Notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Employee ID who made the sale', example: 1 })
  @IsInt()
  @IsNotEmpty()
  soldBy: number;

  @ApiProperty({ description: 'Sale items', type: [CreateSaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}
