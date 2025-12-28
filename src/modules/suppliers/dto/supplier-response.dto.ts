import { ApiProperty } from '@nestjs/swagger';

export class SupplierResponseDto {
  @ApiProperty({ description: 'Supplier ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Supplier code', example: 'S001' })
  code: string;

  @ApiProperty({ description: 'Business name', example: 'Distribuidora ABC S.A.' })
  businessName: string;

  @ApiProperty({ description: 'Tax ID', example: '1234567890' })
  taxId: string;

  @ApiProperty({ description: 'Contact name', nullable: true })
  contactName: string | null;

  @ApiProperty({ description: 'Email', nullable: true })
  email: string | null;

  @ApiProperty({ description: 'Phone', nullable: true })
  phone: string | null;

  @ApiProperty({ description: 'Address', nullable: true })
  address: string | null;

  @ApiProperty({ description: 'City', nullable: true })
  city: string | null;

  @ApiProperty({ description: 'Country', nullable: true })
  country: string | null;

  @ApiProperty({ description: 'Payment terms', nullable: true })
  paymentTerms: string | null;

  @ApiProperty({ description: 'Active status', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
