import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';

class UserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  uuid: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  isActive: boolean;
}

export class EmployeeResponseDto {
  @ApiProperty({
    description: 'Employee ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Associated user',
    type: () => UserDto,
  })
  @Type(() => UserDto)
  user: UserDto;

  @ApiProperty({
    description: 'First name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
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
    description: 'Phone number',
    example: '+591 12345678',
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({
    description: 'Address',
    example: 'Av. Principal #123',
    nullable: true,
  })
  address: string | null;

  @ApiProperty({
    description: 'Hire date',
    example: '2025-01-01',
  })
  hireDate: Date;

  @ApiProperty({
    description: 'Termination date',
    example: null,
    nullable: true,
  })
  terminationDate: Date | null;

  @ApiProperty({
    description: 'Position/job title',
    example: 'Vendedor',
    nullable: true,
  })
  position: string | null;

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
