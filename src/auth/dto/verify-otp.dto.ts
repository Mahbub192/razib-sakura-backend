import { IsString, Length } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Phone number of the user',
    example: '+1234567890',
    type: String,
  })
  @IsString()
  phoneNumber: string

  @ApiProperty({
    description: 'OTP code (4-6 digits)',
    example: '123456',
    type: String,
    minLength: 4,
    maxLength: 6,
  })
  @IsString()
  @Length(4, 6)
  otp: string
}

