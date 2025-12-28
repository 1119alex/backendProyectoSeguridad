import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

class RoleDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  displayName: string;
}

export class UserResponseDto {
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

  @ApiProperty()
  mfaEnabled: boolean;

  @ApiProperty()
  failedLoginAttempts: number;

  @ApiProperty({ type: () => [RoleDto] })
  @Type(() => RoleDto)
  roles: RoleDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  lastLoginAt?: Date;

  @Exclude()
  passwordHash: string;

  @Exclude()
  mfaSecret: string;

  @Exclude()
  deletedAt: Date;

  @Exclude()
  createdBy: number;

  @Exclude()
  updatedBy: number;

  @Exclude()
  deletedBy: number;
}
