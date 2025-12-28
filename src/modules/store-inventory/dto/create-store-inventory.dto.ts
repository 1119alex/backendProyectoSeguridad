import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min, IsOptional } from 'class-validator';

export class CreateStoreInventoryDto {
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ description: 'Store ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  storeId: number;

  @ApiProperty({ description: 'Quantity', example: 100, default: 0 })
  @IsInt()
  @IsOptional()
  @Min(0)
  quantity?: number;
}
