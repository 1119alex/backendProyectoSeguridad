import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ManagerDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  position: string | null;
}

export class StoreResponseDto {
  @ApiProperty({
    description: 'Store ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Store code',
    example: 'T001',
  })
  code: string;

  @ApiProperty({
    description: 'Store name',
    example: 'Tienda Centro',
  })
  name: string;

  @ApiProperty({
    description: 'Address',
    example: 'Av. Principal 123',
  })
  address: string;

  @ApiProperty({
    description: 'City',
    example: 'La Paz',
    nullable: true,
  })
  city: string | null;

  @ApiProperty({
    description: 'Phone number',
    example: '591-2-1234567',
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({
    description: 'Email address',
    example: 'centro@tienda.com',
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    description: 'Manager (employee)',
    type: () => ManagerDto,
    nullable: true,
  })
  @Type(() => ManagerDto)
  manager: ManagerDto | null;

  @ApiProperty({
    description: 'Active status',
    example: true,
  })
  isActive: boolean;

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
}
