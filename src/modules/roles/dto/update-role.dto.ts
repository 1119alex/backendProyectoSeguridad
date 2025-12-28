import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsArray, IsInt } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Role name (unique identifier)',
    example: 'inventory_manager',
    required: false,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @ApiProperty({
    description: 'Display name for the role',
    example: 'Inventory Manager',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  displayName?: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Manages inventory, products and stock',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Permission IDs to assign to this role',
    example: [1, 2, 3],
    required: false,
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  permissionIds?: number[];
}
