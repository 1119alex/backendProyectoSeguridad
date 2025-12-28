import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PurchaseStatus } from '../entities/purchase.entity';

class SupplierDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  code: string;
  @ApiProperty()
  businessName: string;
}

class EmployeeDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
}

class ProductDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  sku: string;
  @ApiProperty()
  name: string;
}

class PurchaseItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: () => ProductDto })
  @Type(() => ProductDto)
  product: ProductDto;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitCost: number;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  receivedQuantity: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PurchaseResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  purchaseNumber: string;

  @ApiProperty({ type: () => SupplierDto })
  @Type(() => SupplierDto)
  supplier: SupplierDto;

  @ApiProperty()
  purchaseDate: Date;

  @ApiProperty({ nullable: true })
  expectedDeliveryDate: Date | null;

  @ApiProperty({ nullable: true })
  actualDeliveryDate: Date | null;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  tax: number;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  shippingCost: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ enum: PurchaseStatus })
  status: PurchaseStatus;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty({ type: () => EmployeeDto })
  @Type(() => EmployeeDto)
  creator: EmployeeDto;

  @ApiProperty({ type: () => EmployeeDto, nullable: true })
  @Type(() => EmployeeDto)
  approver: EmployeeDto | null;

  @ApiProperty({ type: () => EmployeeDto, nullable: true })
  @Type(() => EmployeeDto)
  receiver: EmployeeDto | null;

  @ApiProperty({ type: [PurchaseItemDto] })
  @Type(() => PurchaseItemDto)
  items: PurchaseItemDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
