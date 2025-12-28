import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsEnum, IsString, Min } from 'class-validator';
import { MovementType, LocationType } from '../entities/inventory-movement.entity';

export class CreateInventoryMovementDto {
  @ApiProperty()
  @IsInt()
  productId: number;

  @ApiProperty({ enum: LocationType })
  @IsEnum(LocationType)
  locationType: LocationType;

  @ApiProperty()
  @IsInt()
  locationId: number;

  @ApiProperty({ enum: MovementType })
  @IsEnum(MovementType)
  movementType: MovementType;

  @ApiProperty()
  @IsInt()
  quantity: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  quantityBefore: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  quantityAfter: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  referenceType?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  referenceId?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty()
  @IsInt()
  createdBy: number;
}
