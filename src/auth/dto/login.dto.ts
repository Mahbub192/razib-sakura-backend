import { IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({
    description: 'Phone number of the user',
    example: '+1234567890',
    type: String,
  })
  @IsString()
  phoneNumber: string

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    type: String,
    format: 'password',
  })
  @IsString()
  password: string
}

