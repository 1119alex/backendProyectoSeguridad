import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsEmail, IsInt, IsBoolean } from 'class-validator';

export class UpdateStoreDto {
  @ApiProperty({
    description: 'Store code (unique)',
    example: 'T001',
    required: false,
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  code?: string;

  @ApiProperty({
    description: 'Store name',
    example: 'Tienda Centro',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'Store address',
    example: 'Av. Principal 123',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'City',
    example: 'La Paz',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '591-2-1234567',
    required: false,
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'centro@tienda.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Manager employee ID',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  managerId?: number;

  @ApiProperty({
    description: 'Active status',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
