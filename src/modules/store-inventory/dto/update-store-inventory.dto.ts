import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateStoreInventoryDto {
  @ApiProperty({ description: 'Quantity', required: false })
  @IsInt()
  @IsOptional()
  @Min(0)
  quantity?: number;

  @ApiProperty({ description: 'Reserved quantity', required: false })
  @IsInt()
  @IsOptional()
  @Min(0)
  reservedQuantity?: number;
}
