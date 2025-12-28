import { ApiProperty } from '@nestjs/swagger';

export class PermissionResponseDto {
  @ApiProperty({
    description: 'Permission ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Permission name (unique identifier)',
    example: 'productos:create',
  })
  name: string;

  @ApiProperty({
    description: 'Resource this permission applies to',
    example: 'productos',
  })
  resource: string;

  @ApiProperty({
    description: 'Module (same as resource, for frontend compatibility)',
    example: 'productos',
  })
  module: string; // Alias for resource

  @ApiProperty({
    description: 'Display name for UI',
    example: 'Crear Producto',
  })
  displayName: string;

  @ApiProperty({
    description: 'Action allowed by this permission',
    example: 'create',
  })
  action: string;

  @ApiProperty({
    description: 'Permission description',
    example: 'Allows creating new products',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Creation date',
    example: '2025-11-27T12:00:00.000Z',
  })
  createdAt: Date;
}
