import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ProductDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  sku: string;
  @ApiProperty()
  name: string;
}

class WarehouseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  code: string;
  @ApiProperty()
  name: string;
}

export class WarehouseInventoryResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: () => ProductDto })
  @Type(() => ProductDto)
  product: ProductDto;

  @ApiProperty({ type: () => WarehouseDto })
  @Type(() => WarehouseDto)
  warehouse: WarehouseDto;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  reservedQuantity: number;

  @ApiProperty({ nullable: true })
  lastRestockDate: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
