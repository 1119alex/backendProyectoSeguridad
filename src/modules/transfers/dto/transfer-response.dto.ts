import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LocationType, TransferStatus } from '../entities/transfer.entity';

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

class TransferItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: () => ProductDto })
  @Type(() => ProductDto)
  product: ProductDto;

  @ApiProperty()
  quantityRequested: number;

  @ApiProperty()
  quantitySent: number;

  @ApiProperty()
  quantityReceived: number;

  @ApiProperty()
  createdAt: Date;
}

export class TransferResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  transferNumber: string;

  @ApiProperty({ enum: LocationType })
  fromType: LocationType;

  @ApiProperty()
  fromId: number;

  @ApiProperty({ enum: LocationType })
  toType: LocationType;

  @ApiProperty()
  toId: number;

  @ApiProperty()
  transferDate: Date;

  @ApiProperty({ nullable: true })
  expectedArrivalDate: Date | null;

  @ApiProperty({ nullable: true })
  actualArrivalDate: Date | null;

  @ApiProperty({ enum: TransferStatus })
  status: TransferStatus;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty({ type: () => EmployeeDto })
  @Type(() => EmployeeDto)
  requester: EmployeeDto;

  @ApiProperty({ type: () => EmployeeDto, nullable: true })
  @Type(() => EmployeeDto)
  approver: EmployeeDto | null;

  @ApiProperty({ type: () => EmployeeDto, nullable: true })
  @Type(() => EmployeeDto)
  receiver: EmployeeDto | null;

  @ApiProperty({ type: [TransferItemDto] })
  @Type(() => TransferItemDto)
  items: TransferItemDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
