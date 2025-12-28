import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';

class PermissionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  resource: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  description: string | null;
}

export class RoleResponseDto {
  @ApiProperty({
    description: 'Role ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Role UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  uuid: string;

  @ApiProperty({
    description: 'Role name',
    example: 'inventory_manager',
  })
  name: string;

  @ApiProperty({
    description: 'Display name',
    example: 'Inventory Manager',
  })
  displayName: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Manages inventory, products and stock',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Permissions assigned to this role',
    type: [PermissionDto],
  })
  @Type(() => PermissionDto)
  permissions: PermissionDto[];

  @ApiProperty({
    description: 'Creation date',
    example: '2025-11-27T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2025-11-27T12:00:00.000Z',
  })
  updatedAt: Date;

  @Exclude()
  deletedAt: Date | null;

  @Exclude()
  createdBy: number | null;

  @Exclude()
  updatedBy: number | null;

  @Exclude()
  deletedBy: number | null;
}
