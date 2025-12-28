import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateWarehouseInventoryDto {
  @ApiProperty()
  @IsInt()
  productId: number;

  @ApiProperty()
  @IsInt()
  warehouseId: number;

  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  reservedQuantity?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  lastRestockDate?: string;
}
