import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: 'Username or email' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '123456', description: 'MFA token (if enabled)', required: false })
  @IsString()
  @IsOptional()
  mfaToken?: string;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty()
  tokenType: string;

  @ApiProperty()
  user: {
    id: number;
    uuid: string;
    username: string;
    email: string;
    roles: Array<{
      id: number;
      name: string;
      displayName: string;
      permissions: Array<{
        id: number;
        name: string;
        resource: string;
        action: string;
      }>;
    }>;
    mfaEnabled: boolean;
  };
}

export class MfaRequiredDto {
  @ApiProperty()
  requiresMfa: boolean;

  @ApiProperty()
  message: string;
}
