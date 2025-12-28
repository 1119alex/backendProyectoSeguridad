import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({
    description: 'Customer ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Customer code',
    example: 'C001',
  })
  code: string;

  @ApiProperty({
    description: 'First name',
    example: 'Juan',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Pérez',
  })
  lastName: string;

  @ApiProperty({
    description: 'Document type',
    example: 'CI',
  })
  documentType: string;

  @ApiProperty({
    description: 'Document number',
    example: '12345678',
  })
  documentNumber: string;

  @ApiProperty({
    description: 'Email address',
    example: 'juan.perez@example.com',
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    description: 'Phone number',
    example: '+591 12345678',
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({
    description: 'Address',
    example: 'Calle Principal #123',
    nullable: true,
  })
  address: string | null;

  @ApiProperty({
    description: 'City',
    example: 'La Paz',
    nullable: true,
  })
  city: string | null;

  @ApiProperty({
    description: 'Customer type',
    example: 'individual',
    enum: ['individual', 'business'],
  })
  customerType: 'individual' | 'business';

  @ApiProperty({
    description: 'Tax ID',
    example: '1234567890',
    nullable: true,
  })
  taxId: string | null;

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
