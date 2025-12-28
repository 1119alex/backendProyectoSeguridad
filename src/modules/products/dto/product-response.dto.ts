import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class CategoryDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

export class ProductResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  sku: string;

  @ApiProperty({ nullable: true })
  barcode: string | null;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({ type: () => CategoryDto, nullable: true })
  @Type(() => CategoryDto)
  category: CategoryDto | null;

  @ApiProperty()
  costPrice: number;

  @ApiProperty()
  salePrice: number;

  @ApiProperty({ nullable: true })
  weightKg: number | null;

  @ApiProperty({ nullable: true })
  dimensionsCm: string | null;

  @ApiProperty()
  minStock: number;

  @ApiProperty({ nullable: true })
  maxStock: number | null;

  @ApiProperty({ nullable: true })
  reorderPoint: number | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
