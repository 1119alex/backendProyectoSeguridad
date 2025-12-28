import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsOptional, IsDateString, IsEnum, IsArray, ValidateNested, ArrayMinSize, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { LocationType, TransferStatus } from '../entities/transfer.entity';

class CreateTransferItemDto {
  @ApiProperty()
  @IsInt()
  productId: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantityRequested: number;
}

export class CreateTransferDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transferNumber: string;

  @ApiProperty({ enum: LocationType })
  @IsEnum(LocationType)
  fromType: LocationType;

  @ApiProperty()
  @IsInt()
  fromId: number;

  @ApiProperty({ enum: LocationType })
  @IsEnum(LocationType)
  toType: LocationType;

  @ApiProperty()
  @IsInt()
  toId: number;

  @ApiProperty()
  @IsDateString()
  transferDate: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  expectedArrivalDate?: string;

  @ApiProperty({ required: false, enum: TransferStatus, default: TransferStatus.PENDING })
  @IsEnum(TransferStatus)
  @IsOptional()
  status?: TransferStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty()
  @IsInt()
  requestedBy: number;

  @ApiProperty({ type: [CreateTransferItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTransferItemDto)
  items: CreateTransferItemDto[];
}
