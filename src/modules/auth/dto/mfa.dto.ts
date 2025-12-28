import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnableMfaDto {
  @ApiProperty({ example: '123456', description: 'Verification token from authenticator app' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  token: string;
}

export class VerifyMfaDto {
  @ApiProperty({ example: '123456', description: 'MFA token from authenticator app' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  token: string;
}

export class MfaSetupResponseDto {
  @ApiProperty({ description: 'Base64 encoded QR code image' })
  qrCode: string;

  @ApiProperty({ description: 'Secret key for manual entry' })
  secret: string;

  @ApiProperty({ description: 'Manual entry key (formatted for display)' })
  manualEntryKey: string;

  @ApiProperty({ description: 'OTPAuth URL for authenticator apps' })
  otpauthUrl: string;
}

export class DisableMfaDto {
  @ApiProperty({ example: 'SecurePass123!', description: 'Current password for verification' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '123456', description: 'Current MFA token' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  token: string;
}
