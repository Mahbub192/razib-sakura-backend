import { IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Phone number of the user',
    example: '+1234567890',
    type: String,
  })
  @IsString()
  phoneNumber: string

  @ApiProperty({
    description: 'New password (minimum 8 characters)',
    example: 'NewSecurePass123!',
    type: String,
    format: 'password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  newPassword: string

  @ApiProperty({
    description: 'OTP code received via SMS/Email',
    example: '123456',
    type: String,
  })
  @IsString()
  otp: string
}

