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

class StoreDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  code: string;
  @ApiProperty()
  name: string;
}

export class StoreInventoryResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: () => ProductDto })
  @Type(() => ProductDto)
  product: ProductDto;

  @ApiProperty({ type: () => StoreDto })
  @Type(() => StoreDto)
  store: StoreDto;

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
