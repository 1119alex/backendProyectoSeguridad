import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MovementType, LocationType } from '../entities/inventory-movement.entity';

class ProductDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  sku: string;
  @ApiProperty()
  name: string;
}

class EmployeeDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
}

export class InventoryMovementResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: () => ProductDto })
  @Type(() => ProductDto)
  product: ProductDto;

  @ApiProperty({ enum: LocationType })
  locationType: LocationType;

  @ApiProperty()
  locationId: number;

  @ApiProperty({ enum: MovementType })
  movementType: MovementType;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  quantityBefore: number;

  @ApiProperty()
  quantityAfter: number;

  @ApiProperty({ nullable: true })
  referenceType: string | null;

  @ApiProperty({ nullable: true })
  referenceId: number | null;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty({ type: () => EmployeeDto })
  @Type(() => EmployeeDto)
  creator: EmployeeDto;

  @ApiProperty()
  createdAt: Date;
}
