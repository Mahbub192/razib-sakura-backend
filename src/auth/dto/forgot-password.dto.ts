import { IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Phone number of the user',
    example: '+1234567890',
    type: String,
  })
  @IsString()
  phoneNumber: string
}

