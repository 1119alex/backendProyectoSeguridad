import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ description: 'Category ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Category name', example: 'Electrónica' })
  name: string;

  @ApiProperty({ description: 'Description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Active status', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
