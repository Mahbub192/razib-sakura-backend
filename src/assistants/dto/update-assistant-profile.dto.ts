import { IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateAssistantProfileDto {
  @ApiProperty({
    description: 'Full name of the assistant',
    example: 'Sarah Johnson',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string

  @ApiProperty({
    description: 'Email address',
    example: 'assistant@example.com',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string
}

