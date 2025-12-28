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

class SaleItemDto {
  @ApiProperty()
  id: number;
  @ApiProperty({ type: () => ProductDto })
  @Type(() => ProductDto)
  product: ProductDto;
  @ApiProperty()
  quantity: number;
  @ApiProperty()
  unitPrice: number;
  @ApiProperty()
  discount: number;
  @ApiProperty()
  subtotal: number;
}

class StoreDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
}

class CustomerDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
}

class EmployeeDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
}

export class SaleResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  saleNumber: string;

  @ApiProperty({ type: () => StoreDto })
  @Type(() => StoreDto)
  store: StoreDto;

  @ApiProperty({ type: () => CustomerDto, nullable: true })
  @Type(() => CustomerDto)
  customer: CustomerDto | null;

  @ApiProperty()
  saleDate: Date;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  tax: number;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  paymentMethod: string;

  @ApiProperty()
  paymentStatus: string;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty({ type: () => EmployeeDto })
  @Type(() => EmployeeDto)
  employee: EmployeeDto;

  @ApiProperty({ type: [SaleItemDto] })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
